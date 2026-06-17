package com.cineverse.movie.controller;

import com.cineverse.movie.entity.Movie;
import com.cineverse.movie.repository.MovieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieRepository movieRepository;

    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Movie createMovie(@RequestBody Movie movie) {
        // Simple manual generation of incremental ID for seeding / admin releases
        if (movie.getId() == null) {
            long count = movieRepository.count();
            movie.setId(count + 1);
        }
        return movieRepository.save(movie);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(movieDetails.getTitle());
            movie.setDescription(movieDetails.getDescription());
            movie.setGenre(movieDetails.getGenre());
            movie.setDuration(movieDetails.getDuration());
            movie.setRating(movieDetails.getRating());
            movie.setPosterUrl(movieDetails.getPosterUrl());
            movie.setReleaseDate(movieDetails.getReleaseDate());
            return ResponseEntity.ok(movieRepository.save(movie));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        return movieRepository.findById(id).map(movie -> {
            movieRepository.delete(movie);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
