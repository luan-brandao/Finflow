package com.finflow.financeservice.controller;

import com.finflow.financeservice.dto.CardInvoiceResponseDTO;
import com.finflow.financeservice.service.CardInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards/{cardId}/invoices")
@RequiredArgsConstructor
public class CardInvoiceController {

    private final CardInvoiceService cardInvoiceService;

    @GetMapping
    public ResponseEntity<List<CardInvoiceResponseDTO>> getInvoices(@PathVariable UUID cardId) {
        return ResponseEntity.ok(cardInvoiceService.getInvoices(cardId));
    }

    @PostMapping("/close")
    public ResponseEntity<CardInvoiceResponseDTO> closeInvoice(
            @PathVariable UUID cardId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(cardInvoiceService.closeInvoice(cardId, year, month));
    }

    @PostMapping("/{invoiceId}/pay")
    public ResponseEntity<CardInvoiceResponseDTO> payInvoice(
            @PathVariable UUID cardId,
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(cardInvoiceService.payInvoice(cardId, invoiceId));
    }
}
