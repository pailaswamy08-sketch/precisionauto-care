package com.precisionauto.booking.repository;

import com.precisionauto.booking.model.ServiceBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceBayRepository extends JpaRepository<ServiceBay, Long> {
    Optional<ServiceBay> findByBayNumber(String bayNumber);
}
