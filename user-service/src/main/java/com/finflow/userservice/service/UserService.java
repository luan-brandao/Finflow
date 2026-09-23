package com.finflow.userservice.service;

import com.finflow.userservice.exception.EmailAlreadyExistsException;
import com.finflow.userservice.exception.InvalidCredentialsException;
import com.finflow.userservice.exception.ResourceNotFoundException;
import com.finflow.userservice.mapper.UserMapper;
import com.finflow.userservice.model.Role;
import com.finflow.userservice.model.User;
import com.finflow.userservice.repository.UserRepository;
import com.finflow.userservice.tdo.LoginRequestDTO;
import com.finflow.userservice.tdo.LoginResponseDTO;
import com.finflow.userservice.tdo.UserRequestDTO;
import com.finflow.userservice.tdo.UserResponseDTO;
import com.finflow.userservice.tdo.UserUpdateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponseDTO createUser(
            UserRequestDTO userRequestDTO
    ) {

        User user = userMapper.toEntity(userRequestDTO);

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException(user.getEmail());
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO loginUser(
            LoginRequestDTO loginRequestDTO
    ) {

        User user = userRepository.findByEmail(loginRequestDTO.email())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "E-mail ou senha inválidos"
                        )
                );

        if (!passwordEncoder.matches(
                loginRequestDTO.password(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException(
                    "E-mail ou senha inválidos"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponseDTO(token, "Bearer");
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        )
                );

        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAllUsers(
            Pageable pageable
    ) {

        return userRepository.findAll(pageable)
                .map(userMapper::toDTO);
    }

    @Transactional
    public UserResponseDTO updateUser(
            UUID id,
            UserUpdateDTO userUpdateDTO
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        )
                );

        if (!user.getEmail().equals(userUpdateDTO.email())
                && userRepository.existsByEmail(
                userUpdateDTO.email()
        )) {

            throw new EmailAlreadyExistsException(
                    userUpdateDTO.email()
            );
        }

        userMapper.updateEntity(
                userUpdateDTO,
                user
        );

        user.setPassword(
                passwordEncoder.encode(
                        userUpdateDTO.password()
                )
        );

        User updatedUser = userRepository.save(user);

        return userMapper.toDTO(updatedUser);
    }

    @Transactional
    public void deleteUserByAdmin(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        )
                );

        userRepository.delete(user);
    }

    @Transactional
    public void deleteOwnUser(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        )
                );

        userRepository.delete(user);
    }
}