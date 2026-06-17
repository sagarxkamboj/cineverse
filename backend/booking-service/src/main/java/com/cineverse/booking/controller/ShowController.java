package com.cineverse.booking.controller;

import com.cineverse.booking.entity.Booking;
import com.cineverse.booking.entity.Show;
import com.cineverse.booking.repository.BookingRepository;
import com.cineverse.booking.repository.ShowRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shows")
public class ShowController {

    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;

    public ShowController(ShowRepository showRepository, BookingRepository bookingRepository) {
        this.showRepository = showRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id) {
        return showRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{movieId}")
    public List<Show> getShowsByMovieId(@PathVariable Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    @GetMapping("/{id}/booked-seats")
    public List<String> getBookedSeats(@PathVariable Long id) {
        return bookingRepository.findByShowId(id).stream()
                .map(Booking::getSeatNumber)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('THEATRE_OWNER') or hasRole('ADMIN')")
    public Show createShow(@RequestBody Show show) {
        return showRepository.save(show);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('THEATRE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteShow(@PathVariable Long id) {
        return showRepository.findById(id).map(show -> {
            showRepository.delete(show);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
