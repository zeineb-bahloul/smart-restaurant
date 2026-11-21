package com.restaurant.smart_restaurant.service;

import com.restaurant.smart_restaurant.dto.ReservationDto;
import com.restaurant.smart_restaurant.model.Reservation;
import com.restaurant.smart_restaurant.model.User;
import com.restaurant.smart_restaurant.repository.ReservationRepository;
import com.restaurant.smart_restaurant.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation create(UUID userId, ReservationDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'id : " + userId));

        Reservation reservation = Reservation.builder()
                .user(user)
                .date(dto.getDate())
                .time(dto.getTime())
                .guests(dto.getGuests())
                .note(dto.getNote())
                .status("PENDING")
                .build();

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getMyReservations(UUID userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    @Transactional
    public Reservation updateStatus(UUID id, String status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réservation non trouvée avec l'id : " + id));
        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }
}
