package com.finflow.financeservice.mapper;

import com.finflow.financeservice.dto.TransactionResponseDTO;
import com.finflow.financeservice.model.Transaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    TransactionResponseDTO toResponseDTO(Transaction transaction);
}