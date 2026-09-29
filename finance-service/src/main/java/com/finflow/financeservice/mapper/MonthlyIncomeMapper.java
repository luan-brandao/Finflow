package com.finflow.financeservice.mapper;

import com.finflow.financeservice.dto.MonthlyIncomeResponseDTO;
import com.finflow.financeservice.model.MonthlyIncome;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MonthlyIncomeMapper {

    MonthlyIncomeResponseDTO toResponseDTO(MonthlyIncome monthlyIncome);
}
