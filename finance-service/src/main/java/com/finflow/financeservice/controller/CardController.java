package com.finflow.financeservice.controller;

import com.finflow.financeservice.dto.CardRequestDTO;
import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public ResponseEntity<CardResponseDTO> create(@Valid @RequestBody CardRequestDTO request) {
        CardResponseDTO response = cardService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CardResponseDTO>> findAll() {
        return ResponseEntity.ok(cardService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(cardService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponseDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody CardRequestDTO request
    ) {
        return ResponseEntity.ok(cardService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay-advance")
    public ResponseEntity<CardResponseDTO> payAdvance(
            @PathVariable UUID id,
            @RequestParam java.math.BigDecimal amount
    ) {
        return ResponseEntity.ok(cardService.payAdvance(id, amount));
    }
}
