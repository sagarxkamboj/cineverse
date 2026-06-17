package com.cineverse.booking.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "cineverse.exchange";
    public static final String QUEUE_CONFIRM = "notification.booking.confirm";
    public static final String QUEUE_CANCEL = "notification.booking.cancel";
    public static final String ROUTING_KEY_CONFIRM = "booking.confirmed";
    public static final String ROUTING_KEY_CANCEL = "booking.cancelled";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue confirmQueue() {
        return new Queue(QUEUE_CONFIRM);
    }

    @Bean
    public Queue cancelQueue() {
        return new Queue(QUEUE_CANCEL);
    }

    @Bean
    public Binding bindingConfirm(Queue confirmQueue, TopicExchange exchange) {
        return BindingBuilder.bind(confirmQueue).to(exchange).with(ROUTING_KEY_CONFIRM);
    }

    @Bean
    public Binding bindingCancel(Queue cancelQueue, TopicExchange exchange) {
        return BindingBuilder.bind(cancelQueue).to(exchange).with(ROUTING_KEY_CANCEL);
    }
}
