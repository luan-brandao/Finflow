package com.finflow.financeservice.mapper;


import com.finflow.financeservice.dto.CategoryResponseDTO;
import com.finflow.financeservice.model.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponseDTO toResponseDTO(Category category);
}