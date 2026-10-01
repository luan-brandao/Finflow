package com.finflow.financeservice.mapper;

import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.model.Goal;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface GoalMapper {

    Goal toEntity(GoalRequestDTO requestDTO);

    GoalResponseDTO toDTO(Goal entity);

    void updateEntity(GoalRequestDTO requestDTO, @MappingTarget Goal entity);
}
