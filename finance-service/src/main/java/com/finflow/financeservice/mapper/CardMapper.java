package com.finflow.financeservice.mapper;

import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.model.Card;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface CardMapper {

    @Mapping(target = "id", source = "card.id")
    @Mapping(target = "userId", source = "card.userId")
    @Mapping(target = "name", source = "card.name")
    @Mapping(target = "creditLimit", source = "card.creditLimit")
    @Mapping(target = "createdAt", source = "card.createdAt")
    @Mapping(target = "updatedAt", source = "card.updatedAt")
    CardResponseDTO toResponseDTO(Card card, BigDecimal used, BigDecimal available);
}
