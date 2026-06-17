package com.cineverse.controller;

import com.cineverse.entity.Booking;
import com.cineverse.entity.Show;
import com.cineverse.repository.BookingRepository;
import com.cineverse.repository.ShowRepository;
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

    @GetMapping("/movie/{movieId}")
    public List<Show> getShowsByMovie(@PathVariable Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    @GetMapping("/{showId}/booked-seats")
    public List<String> getBookedSeats(@PathVariable Long showId) {
        return bookingRepository.findByShowId(showId).stream()
                .map(Booking::getSeatNumber)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public Show createShow(@RequestBody Show show) {
        return showRepository.save(show);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<Show> updateShow(@PathVariable Long id, @RequestBody Show details) {
        return showRepository.findById(id).map(show -> {
            show.setMovieId(details.getMovieId());
            show.setTheatreId(details.getTheatreId());
            show.setShowTime(details.getShowTime());
            show.setPrice(details.getPrice());
            show.setAvailableSeats(details.getAvailableSeats());
            return ResponseEntity.ok(showRepository.save(show));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<?> deleteShow(@PathVariable Long id) {
        return showRepository.findById(id).map(show -> {
            showRepository.delete(show);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
