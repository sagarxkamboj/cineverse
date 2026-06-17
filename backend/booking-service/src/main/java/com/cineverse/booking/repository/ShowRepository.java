package com.cineverse.booking.repository;

import com.cineverse.booking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByMovieId(Long movieId);
}
