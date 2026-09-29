package com.finflow.financeservice.controller;

import com.finflow.financeservice.dto.MonthlyIncomeRequestDTO;
import com.finflow.financeservice.dto.MonthlyIncomeResponseDTO;
import com.finflow.financeservice.service.MonthlyIncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monthly-income")
@RequiredArgsConstructor
public class MonthlyIncomeController {

    private final MonthlyIncomeService monthlyIncomeService;

    @PutMapping
    public ResponseEntity<MonthlyIncomeResponseDTO> createOrUpdate(@Valid @RequestBody MonthlyIncomeRequestDTO request) {
        return ResponseEntity.ok(monthlyIncomeService.createOrUpdate(request));
    }

    @GetMapping
    public ResponseEntity<MonthlyIncomeResponseDTO> findCurrentMonthIncome() {
        return ResponseEntity.ok(monthlyIncomeService.findCurrentMonthIncome());
    }

    @GetMapping("/{year}/{month}")
    public ResponseEntity<MonthlyIncomeResponseDTO> findByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month
    ) {
        return ResponseEntity.ok(monthlyIncomeService.findByYearAndMonth(year, month));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MonthlyIncomeResponseDTO>> findAll() {
        return ResponseEntity.ok(monthlyIncomeService.findAll());
    }

    @DeleteMapping("/{year}/{month}")
    public ResponseEntity<Void> deleteByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month
    ) {
        monthlyIncomeService.deleteByYearAndMonth(year, month);
        return ResponseEntity.noContent().build();
    }
}
