package com.cineverse.movie.repository;

import com.cineverse.movie.entity.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MovieRepository extends MongoRepository<Movie, Long> {
    List<Movie> findByGenreContainingIgnoreCase(String genre);
    List<Movie> findByTitleContainingIgnoreCase(String title);
}
