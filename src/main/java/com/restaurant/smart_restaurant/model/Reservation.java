package com.restaurant.smart_restaurant.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)//Charge automatiquement les infos du client quand on charge la réservation
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

    @Column(nullable = false)
    private Integer guests;

    @Column(nullable = false)
    private String status = "PENDING"; 

    private String note;

    public Reservation() {
    }

    public Reservation(UUID id, User user, LocalDate date, LocalTime time, Integer guests, String status, String note) {
        this.id = id;
        this.user = user;
        this.date = date;
        this.time = time;
        this.guests = guests;
        this.status = status != null ? status : "PENDING";
        this.note = note;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public static ReservationBuilder builder() {
        return new ReservationBuilder();
    }

    public static class ReservationBuilder {
        private UUID id;
        private User user;
        private LocalDate date;
        private LocalTime time;
        private Integer guests;
        private String status = "PENDING";
        private String note;

        ReservationBuilder() {}

        public ReservationBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ReservationBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ReservationBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ReservationBuilder time(LocalTime time) {
            this.time = time;
            return this;
        }

        public ReservationBuilder guests(Integer guests) {
            this.guests = guests;
            return this;
        }

        public ReservationBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ReservationBuilder note(String note) {
            this.note = note;
            return this;
        }

        public Reservation build() {
            return new Reservation(id, user, date, time, guests, status, note);
        }
    }
}
