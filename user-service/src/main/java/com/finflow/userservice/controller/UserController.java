package com.finflow.userservice.controller;

import com.finflow.userservice.service.UserService;
import com.finflow.userservice.tdo.UserResponseDTO;
import com.finflow.userservice.tdo.UserUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /*
     * ADMIN
     * Busca qualquer usuário pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findUserById(
            @PathVariable UUID id
    ) {

        UserResponseDTO response =
                userService.findUserById(id);

        return ResponseEntity.ok(response);
    }

    /*
     * ADMIN
     * Lista todos os usuários com paginação.
     */
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAllUsers(
            @PageableDefault(size = 10, sort = "name")
            Pageable pageable
    ) {

        Page<UserResponseDTO> response =
                userService.findAllUsers(pageable);

        return ResponseEntity.ok(response);
    }

    /*
     * USUÁRIO LOGADO
     * Busca os próprios dados usando o ID presente no JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> findOwnUser(
            Authentication authentication
    ) {

        UUID id = UUID.fromString(authentication.getName());

        UserResponseDTO response =
                userService.findUserById(id);

        return ResponseEntity.ok(response);
    }

    /*
     * ADMIN
     * Atualiza qualquer usuário pelo ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO
    ) {

        UserResponseDTO response =
                userService.updateUser(id, userUpdateDTO);

        return ResponseEntity.ok(response);
    }

    /*
     * USUÁRIO LOGADO
     * Atualiza os próprios dados usando o ID presente no JWT.
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateOwnUser(
            @Valid @RequestBody UserUpdateDTO userUpdateDTO,
            Authentication authentication
    ) {

        UUID id = UUID.fromString(authentication.getName());

        UserResponseDTO response =
                userService.updateUser(id, userUpdateDTO);

        return ResponseEntity.ok(response);
    }

    /*
     * ADMIN
     * Exclui qualquer usuário pelo ID.
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteUserByAdmin(
            @PathVariable UUID id
    ) {

        userService.deleteUserByAdmin(id);

        return ResponseEntity.noContent().build();
    }

    /*
     * USUÁRIO LOGADO
     * Exclui a própria conta.
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteOwnUser(
            Authentication authentication
    ) {

        UUID id = UUID.fromString(authentication.getName());

        userService.deleteOwnUser(id);

        return ResponseEntity.noContent().build();
    }
}