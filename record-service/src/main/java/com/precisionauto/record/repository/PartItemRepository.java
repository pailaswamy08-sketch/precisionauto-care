package com.precisionauto.record.repository;

import com.precisionauto.record.model.PartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartItemRepository extends JpaRepository<PartItem, Long> {
    List<PartItem> findByServiceRecordId(Long serviceRecordId);
}
