package com.cineverse.booking.controller;

import com.cineverse.booking.entity.Theatre;
import com.cineverse.booking.repository.TheatreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/theatres")
public class TheatreController {

    private final TheatreRepository theatreRepository;

    public TheatreController(TheatreRepository theatreRepository) {
        this.theatreRepository = theatreRepository;
    }

    @GetMapping
    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theatre> getTheatreById(@PathVariable Long id) {
        return theatreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('THEATRE_OWNER') or hasRole('ADMIN')")
    public Theatre createTheatre(@RequestBody Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('THEATRE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteTheatre(@PathVariable Long id) {
        return theatreRepository.findById(id).map(theatre -> {
            theatreRepository.delete(theatre);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
