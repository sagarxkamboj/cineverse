package com.cineverse.movie.repository;

import com.cineverse.movie.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByMovieId(Long movieId);
}
