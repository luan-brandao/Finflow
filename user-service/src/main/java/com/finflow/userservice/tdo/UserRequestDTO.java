package com.finflow.userservice.tdo;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequestDTO(
        @NotBlank (message = "O nome é obrigatorio")
        @Size(max = 70)
        String name,
        @NotBlank(message= "email é obrigatorio" )
        @Email
        String email,

        @NotBlank
        @Size(min = 8 ,  max = 100)
        String password


) {
}
