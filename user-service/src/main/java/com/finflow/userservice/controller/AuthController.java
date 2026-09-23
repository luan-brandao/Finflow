package com.finflow.userservice.controller;

import com.finflow.userservice.service.UserService;
import com.finflow.userservice.tdo.LoginRequestDTO;
import com.finflow.userservice.tdo.LoginResponseDTO;
import com.finflow.userservice.tdo.UserRequestDTO;
import com.finflow.userservice.tdo.UserResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(
            @Valid @RequestBody UserRequestDTO userRequestDTO
    ) {

        UserResponseDTO response = userService.createUser(userRequestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO loginRequestDTO
    ) {

        LoginResponseDTO response = userService.loginUser(loginRequestDTO);

        return ResponseEntity.ok(response);
    }
}