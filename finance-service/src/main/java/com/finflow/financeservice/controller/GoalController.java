package com.finflow.financeservice.controller;

import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalResponseDTO> create(@Valid @RequestBody GoalRequestDTO request) {
        GoalResponseDTO response = goalService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<GoalResponseDTO>> findAll() {
        return ResponseEntity.ok(goalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(goalService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody GoalRequestDTO request
    ) {
        return ResponseEntity.ok(goalService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        goalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
