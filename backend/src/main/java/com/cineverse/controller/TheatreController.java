package com.cineverse.controller;

import com.cineverse.entity.Theatre;
import com.cineverse.repository.TheatreRepository;
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

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public List<Theatre> getTheatresByOwner(@PathVariable Long ownerId) {
        return theatreRepository.findByOwnerId(ownerId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public Theatre createTheatre(@RequestBody Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<Theatre> updateTheatre(@PathVariable Long id, @RequestBody Theatre details) {
        return theatreRepository.findById(id).map(theatre -> {
            theatre.setName(details.getName());
            theatre.setLocation(details.getLocation());
            return ResponseEntity.ok(theatreRepository.save(theatre));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<?> deleteTheatre(@PathVariable Long id) {
        return theatreRepository.findById(id).map(theatre -> {
            theatreRepository.delete(theatre);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
