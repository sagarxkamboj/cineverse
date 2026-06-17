package com.cineverse.notification.listener;

import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    @RabbitListener(queuesToDeclare = @Queue("notification.booking.confirm"))
    public void handleBookingConfirmation(String message) {
        System.out.println("====== [NOTIFICATION SERVICE] EMAIL & SMS CONFIRMATION DISPATCHED ======");
        System.out.println("Message: " + message);
        System.out.println("======================================================================");
    }

    @RabbitListener(queuesToDeclare = @Queue("notification.booking.cancel"))
    public void handleBookingCancellation(String message) {
        System.out.println("====== [NOTIFICATION SERVICE] BOOKING CANCELLATION SENT ======");
        System.out.println("Message: " + message);
        System.out.println("======================================================================");
    }
}
