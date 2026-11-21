package com.restaurant.smart_restaurant.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class ReservationDto {

    @NotNull(message = "La date de réservation est obligatoire")
    @FutureOrPresent(message = "La date doit être aujourd'hui ou dans le futur")
    private LocalDate date;

    @NotNull(message = "L'heure de réservation est obligatoire")
    private LocalTime time;

    @NotNull(message = "Le nombre de convives est obligatoire")
    @Min(value = 1, message = "Il doit y avoir au moins 1 convive")
    private Integer guests;

    private String note;

    public ReservationDto() {
    }

    public ReservationDto(LocalDate date, LocalTime time, Integer guests, String note) {
        this.date = date;
        this.time = time;
        this.guests = guests;
        this.note = note;
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
