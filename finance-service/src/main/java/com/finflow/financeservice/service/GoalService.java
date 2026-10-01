package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.GoalMapper;
import com.finflow.financeservice.model.Goal;
import com.finflow.financeservice.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalMapper goalMapper;

    @Transactional
    public GoalResponseDTO create(GoalRequestDTO request) {
        UUID userId = getAuthenticatedUserId();

        Goal goal = goalMapper.toEntity(request);
        goal.setUserId(userId);

        Goal savedGoal = goalRepository.save(goal);
        return goalMapper.toDTO(savedGoal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponseDTO> findAll() {
        UUID userId = getAuthenticatedUserId();
        return goalRepository.findByUserId(userId)
                .stream()
                .map(goalMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponseDTO findById(UUID id) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        return goalMapper.toDTO(goal);
    }

    @Transactional
    public GoalResponseDTO update(UUID id, GoalRequestDTO request) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        goalMapper.updateEntity(request, goal);
        Goal updatedGoal = goalRepository.save(goal);
        return goalMapper.toDTO(updatedGoal);
    }

    @Transactional
    public void delete(UUID id) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        goalRepository.delete(goal);
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
