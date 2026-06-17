package com.cineverse.booking.controller;

import com.cineverse.booking.entity.Booking;
import com.cineverse.booking.repository.BookingRepository;
import com.cineverse.booking.service.SeatLockService;
import com.cineverse.booking.config.RabbitMQConfig;
import com.cineverse.booking.security.UserDetailsImpl;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final SeatLockService seatLockService;
    private final RabbitTemplate rabbitTemplate;

    public BookingController(BookingRepository bookingRepository, 
                             SeatLockService seatLockService, 
                             RabbitTemplate rabbitTemplate) {
        this.bookingRepository = bookingRepository;
        this.seatLockService = seatLockService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<Booking> getAllBookings(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            return bookingRepository.findAll();
        } else {
            return bookingRepository.findByUserId(userDetails.getId());
        }
    }

    @PostMapping("/lock")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> lockSeat(@RequestBody Map<String, String> request) {
        try {
            Long showId = Long.parseLong(request.get("showId"));
            String seatNo = request.get("seatNumber");
            String userId = request.get("userId");

            boolean locked = seatLockService.lockSeat(showId, seatNo, userId);
            if (locked) {
                return ResponseEntity.ok(Map.of("message", "Seat locked successfully for 5 minutes"));
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Seat is already locked or selected by another user.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid parameters: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        // 1. Check if the seat is already booked in PostgreSQL
        List<Booking> bookedSeats = bookingRepository.findByShowId(booking.getShowId());
        boolean alreadyBooked = bookedSeats.stream()
                .anyMatch(b -> b.getSeatNumber().equalsIgnoreCase(booking.getSeatNumber()));
        
        if (alreadyBooked) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Seat already booked.");
        }

        // 2. Check if locked in Redis by someone else
        if (seatLockService.isSeatLocked(booking.getShowId(), booking.getSeatNumber())) {
            String lockOwner = seatLockService.getSeatLockOwner(booking.getShowId(), booking.getSeatNumber());
            if (lockOwner != null && !lockOwner.equals(booking.getUserId().toString())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Seat is locked by another user.");
            }
        }

        // 3. Complete booking
        booking.setBookingDate(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        // 4. Release Redis lock
        seatLockService.unlockSeat(booking.getShowId(), booking.getSeatNumber());

        // 5. Send confirmation to RabbitMQ
        try {
            String confirmationMessage = String.format("CONFIRMED: Booking ID %d, User ID %d, Show ID %d, Seat %s", 
                    savedBooking.getId(), savedBooking.getUserId(), savedBooking.getShowId(), savedBooking.getSeatNumber());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_CONFIRM, confirmationMessage);
        } catch (Exception e) {
            System.err.println("Failed to publish booking confirmation to RabbitMQ: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedBooking);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            bookingRepository.delete(booking);

            // Send cancellation to RabbitMQ
            try {
                String cancellationMessage = String.format("CANCELLED: Booking ID %d, User ID %d, Show ID %d, Seat %s", 
                        booking.getId(), booking.getUserId(), booking.getShowId(), booking.getSeatNumber());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_CANCEL, cancellationMessage);
            } catch (Exception e) {
                System.err.println("Failed to publish booking cancellation to RabbitMQ: " + e.getMessage());
            }

            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
