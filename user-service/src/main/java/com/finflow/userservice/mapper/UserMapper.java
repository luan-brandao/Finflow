package com.finflow.userservice.mapper;

import com.finflow.userservice.model.User;
import com.finflow.userservice.tdo.UserRequestDTO;
import com.finflow.userservice.tdo.UserResponseDTO;
import com.finflow.userservice.tdo.UserUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(UserRequestDTO userRequestDTO);

    UserResponseDTO toDTO(User user);

    void updateEntity(
            UserUpdateDTO userUpdateDTO,
            @MappingTarget User user
    );
}