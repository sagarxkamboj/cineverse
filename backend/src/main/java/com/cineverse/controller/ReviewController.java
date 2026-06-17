package com.cineverse.controller;

import com.cineverse.entity.Review;
import com.cineverse.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/movie/{id}")
    public List<Review> getReviewsByMovie(@PathVariable Long id) {
        return reviewRepository.findByMovieId(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public Review createReview(@RequestBody Review review) {
        return reviewRepository.save(review);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            reviewRepository.delete(review);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
