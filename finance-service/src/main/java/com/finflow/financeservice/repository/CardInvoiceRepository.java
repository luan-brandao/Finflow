package com.finflow.financeservice.repository;

import com.finflow.financeservice.model.CardInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardInvoiceRepository extends JpaRepository<CardInvoice, UUID> {
    List<CardInvoice> findByCardId(UUID cardId);
    Optional<CardInvoice> findByCardIdAndYearAndMonth(UUID cardId, int year, int month);
    List<CardInvoice> findByUserId(UUID userId);
    List<CardInvoice> findByUserIdAndStatus(UUID userId, String status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(ci.amount), 0) FROM CardInvoice ci WHERE ci.cardId = :cardId AND ci.status = 'PAID'")
    java.math.BigDecimal sumPaidInvoicesByCardId(@org.springframework.data.repository.query.Param("cardId") UUID cardId);
}
