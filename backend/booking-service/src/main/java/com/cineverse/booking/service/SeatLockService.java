package com.cineverse.booking.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class SeatLockService {

    private final StringRedisTemplate redisTemplate;

    public SeatLockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean lockSeat(Long showId, String seatNo, String userId) {
        String key = "seat:" + showId + ":" + seatNo;
        // setIfAbsent behaves like SETNX and will return true only if the key did not exist
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, userId, Duration.ofMinutes(5));
        return success != null && success;
    }

    public boolean isSeatLocked(Long showId, String seatNo) {
        String key = "seat:" + showId + ":" + seatNo;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public String getSeatLockOwner(Long showId, String seatNo) {
        String key = "seat:" + showId + ":" + seatNo;
        return redisTemplate.opsForValue().get(key);
    }

    public void unlockSeat(Long showId, String seatNo) {
        String key = "seat:" + showId + ":" + seatNo;
        redisTemplate.delete(key);
    }
}
