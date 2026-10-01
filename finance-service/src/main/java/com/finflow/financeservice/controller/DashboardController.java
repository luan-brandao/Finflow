package com.finflow.financeservice.controller;
 
import com.finflow.financeservice.dto.DashboardResponseDTO;
import com.finflow.financeservice.service.DashboardService;
import com.finflow.financeservice.model.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
 
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponseDTO> getDashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            UUID cardId,

            @RequestParam(required = false)
            UUID categoryId,

            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            UUID goalId
    ) {

        if (startDate == null && endDate == null) {
            LocalDate today = LocalDate.now();

            startDate = today.withDayOfMonth(1);
            endDate = today;
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "startDate e endDate devem ser informados juntos."
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "startDate não pode ser posterior a endDate."
            );
        }

        DashboardResponseDTO dashboard =
                dashboardService.getDashboard(
                        startDate,
                        endDate,
                        cardId,
                        categoryId,
                        type,
                        goalId
                );

        return ResponseEntity.ok(dashboard);
    }
}