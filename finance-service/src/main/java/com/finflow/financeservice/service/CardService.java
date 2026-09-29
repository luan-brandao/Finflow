package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CardRequestDTO;
import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.CardMapper;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;
    private final CardMapper cardMapper;

    @Transactional
    public CardResponseDTO create(CardRequestDTO request) {
        UUID userId = getAuthenticatedUserId();

        if (request.creditLimit().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O limite de crédito do cartão não pode ser negativo.");
        }

        Card card = new Card();
        card.setUserId(userId);
        card.setName(request.name().trim());
        card.setCreditLimit(request.creditLimit());

        Card savedCard = cardRepository.save(card);

        return cardMapper.toResponseDTO(savedCard, BigDecimal.ZERO, savedCard.getCreditLimit());
    }

    @Transactional(readOnly = true)
    public List<CardResponseDTO> findAll() {
        UUID userId = getAuthenticatedUserId();

        return cardRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CardResponseDTO findById(UUID id) {
        UUID userId = getAuthenticatedUserId();

        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));

        return mapToResponseDTO(card);
    }

    @Transactional
    public CardResponseDTO update(UUID id, CardRequestDTO request) {
        UUID userId = getAuthenticatedUserId();

        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));

        if (request.creditLimit().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O limite de crédito do cartão não pode ser negativo.");
        }

        BigDecimal used = transactionRepository.sumExpenseByCardId(id);
        if (request.creditLimit().compareTo(used) < 0) {
            throw new IllegalArgumentException("O limite do cartão não pode ser reduzido para um valor menor que o total já utilizado (R$ " + used + ").");
        }

        card.setName(request.name().trim());
        card.setCreditLimit(request.creditLimit());

        Card updatedCard = cardRepository.save(card);

        return mapToResponseDTO(updatedCard);
    }

    @Transactional
    public void delete(UUID id) {
        UUID userId = getAuthenticatedUserId();

        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));

        cardRepository.delete(card);
    }

    private CardResponseDTO mapToResponseDTO(Card card) {
        BigDecimal used = transactionRepository.sumExpenseByCardId(card.getId());
        BigDecimal available = card.getCreditLimit().subtract(used);
        return cardMapper.toResponseDTO(card, used, available);
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
