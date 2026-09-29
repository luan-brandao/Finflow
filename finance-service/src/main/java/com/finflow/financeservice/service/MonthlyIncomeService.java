package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.MonthlyIncomeRequestDTO;
import com.finflow.financeservice.dto.MonthlyIncomeResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.MonthlyIncomeMapper;
import com.finflow.financeservice.model.MonthlyIncome;
import com.finflow.financeservice.repository.MonthlyIncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MonthlyIncomeService {

    private final MonthlyIncomeRepository monthlyIncomeRepository;
    private final MonthlyIncomeMapper monthlyIncomeMapper;

    @Transactional
    public MonthlyIncomeResponseDTO createOrUpdate(MonthlyIncomeRequestDTO request) {
        UUID userId = getAuthenticatedUserId();

        validateRequest(request);

        Optional<MonthlyIncome> existing = monthlyIncomeRepository
                .findByUserIdAndYearAndMonth(userId, request.year(), request.month());

        MonthlyIncome monthlyIncome;
        if (existing.isPresent()) {
            monthlyIncome = existing.get();
            monthlyIncome.setAmount(request.amount());
        } else {
            monthlyIncome = new MonthlyIncome();
            monthlyIncome.setUserId(userId);
            monthlyIncome.setYear(request.year());
            monthlyIncome.setMonth(request.month());
            monthlyIncome.setAmount(request.amount());
        }

        MonthlyIncome saved = monthlyIncomeRepository.save(monthlyIncome);
        return monthlyIncomeMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public MonthlyIncomeResponseDTO findCurrentMonthIncome() {
        UUID userId = getAuthenticatedUserId();
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        MonthlyIncome income = monthlyIncomeRepository
                .findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Renda de referência não configurada para o mês atual."));

        return monthlyIncomeMapper.toResponseDTO(income);
    }

    @Transactional(readOnly = true)
    public MonthlyIncomeResponseDTO findByYearAndMonth(int year, int month) {
        UUID userId = getAuthenticatedUserId();

        MonthlyIncome income = monthlyIncomeRepository
                .findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Renda de referência não encontrada para o período especificado."));

        return monthlyIncomeMapper.toResponseDTO(income);
    }

    @Transactional(readOnly = true)
    public List<MonthlyIncomeResponseDTO> findAll() {
        UUID userId = getAuthenticatedUserId();

        return monthlyIncomeRepository.findByUserIdOrderByYearDescMonthDesc(userId)
                .stream()
                .map(monthlyIncomeMapper::toResponseDTO)
                .toList();
    }

    @Transactional
    public void deleteByYearAndMonth(int year, int month) {
        UUID userId = getAuthenticatedUserId();

        MonthlyIncome income = monthlyIncomeRepository
                .findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Renda de referência não encontrada para o período especificado."));

        monthlyIncomeRepository.delete(income);
    }

    private void validateRequest(MonthlyIncomeRequestDTO request) {
        if (request.year() < 1900 || request.year() > 2100) {
            throw new IllegalArgumentException("Ano inválido. Deve ser entre 1900 e 2100.");
        }
        if (request.month() < 1 || request.month() > 12) {
            throw new IllegalArgumentException("Mês inválido. Deve ser entre 1 e 12.");
        }
        if (request.amount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("A renda mensal de referência não pode ser negativa.");
        }
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado.");
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new AccessDeniedException("Usuário autenticado inválido.");
        }
    }
}
