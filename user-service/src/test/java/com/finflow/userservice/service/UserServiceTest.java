
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;


    // =========================================================
    // CREATE USER
    // =========================================================

    @Test
    void shouldCreateUserSuccessfully() {

        UserRequestDTO request = mock(UserRequestDTO.class);
        User user = new User();
        User savedUser = new User();
        UserResponseDTO response = mock(UserResponseDTO.class);

        user.setEmail("luan@finflow.com");
        user.setPassword("12345678");


        when(userMapper.toEntity(request))
                .thenReturn(user);

        when(userRepository.existsByEmail("luan@finflow.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("12345678"))
                .thenReturn("encoded-password");

        when(userRepository.save(user))
                .thenReturn(savedUser);

        when(userMapper.toDTO(savedUser))
                .thenReturn(response);

        UserResponseDTO result =
                userService.createUser(request);

        assertSame(response, result);
        assertEquals("encoded-password", user.getPassword());
        assertEquals(Role.USER, user.getRole());

        verify(userMapper).toEntity(request);
        verify(userRepository).existsByEmail("luan@finflow.com");
        verify(passwordEncoder).encode("12345678");
        verify(userRepository).save(user);
        verify(userMapper).toDTO(savedUser);
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        UserRequestDTO request = mock(UserRequestDTO.class);
        User user = new User();

        user.setEmail("luan@finflow.com");



        when(userMapper.toEntity(request))
                .thenReturn(user);

        when(userRepository.existsByEmail("luan@finflow.com"))
                .thenReturn(true);

        EmailAlreadyExistsException exception =
                assertThrows(
                        EmailAlreadyExistsException.class,
                        () -> userService.createUser(request)
                );

        assertEquals(
                "luan@finflow.com",
                exception.getMessage()
        );

        verify(userRepository)
                .existsByEmail("luan@finflow.com");

        verify(userRepository, never())
                .save(any());

        verify(passwordEncoder, never())
                .encode(anyString());
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void shouldLoginSuccessfully() {

        LoginRequestDTO request = mock(LoginRequestDTO.class);
        User user = new User();
        LoginResponseDTO response = new LoginResponseDTO(
                "jwt-token",
                "Bearer"
        );

        user.setId(UUID.randomUUID());
        user.setEmail("luan@finflow.com");
        user.setPassword("encoded-password");
        user.setRole(Role.USER);

        when(request.email())
                .thenReturn("luan@finflow.com");

        when(request.password())
                .thenReturn("12345678");

        when(userRepository.findByEmail("luan@finflow.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "12345678",
                "encoded-password"
        )).thenReturn(true);

        when(jwtService.generateToken(user))
                .thenReturn("jwt-token");

        LoginResponseDTO result =
                userService.loginUser(request);

        assertEquals(
                "jwt-token",
                result.token()
        );

        assertEquals(
                "Bearer",
                result.type()
        );

        verify(userRepository)
                .findByEmail("luan@finflow.com");

        verify(passwordEncoder)
                .matches(
                        "12345678",
                        "encoded-password"
                );

        verify(jwtService)
                .generateToken(user);
    }

    @Test
    void shouldThrowInvalidCredentialsWhenEmailDoesNotExist() {

        LoginRequestDTO request = mock(LoginRequestDTO.class);

        when(request.email())
                .thenReturn("naoexiste@finflow.com");

        when(userRepository.findByEmail(
                "naoexiste@finflow.com"
        )).thenReturn(Optional.empty());

        InvalidCredentialsException exception =
                assertThrows(
                        InvalidCredentialsException.class,
                        () -> userService.loginUser(request)
                );

        assertEquals(
                "E-mail ou senha inválidos",
                exception.getMessage()
        );

        verify(passwordEncoder, never())
                .matches(anyString(), anyString());

        verify(jwtService, never())
                .generateToken(any());
    }

    @Test
    void shouldThrowInvalidCredentialsWhenPasswordIsWrong() {

        LoginRequestDTO request = mock(LoginRequestDTO.class);
        User user = new User();

        user.setEmail("luan@finflow.com");
        user.setPassword("encoded-password");

        when(request.email())
                .thenReturn("luan@finflow.com");

        when(request.password())
                .thenReturn("senha-errada");

        when(userRepository.findByEmail(
                "luan@finflow.com"
        )).thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "senha-errada",
                "encoded-password"
        )).thenReturn(false);

        InvalidCredentialsException exception =
                assertThrows(
                        InvalidCredentialsException.class,
                        () -> userService.loginUser(request)
                );

        assertEquals(
                "E-mail ou senha inválidos",
                exception.getMessage()
        );

        verify(jwtService, never())
                .generateToken(any());
    }


    // =========================================================
    // FIND USER BY ID
    // =========================================================

    @Test
    void shouldFindUserByIdSuccessfully() {

        UUID id = UUID.randomUUID();

        User user = new User();
        UserResponseDTO response = mock(UserResponseDTO.class);

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        when(userMapper.toDTO(user))
                .thenReturn(response);

        UserResponseDTO result =
                userService.findUserById(id);

        assertSame(response, result);

        verify(userRepository)
                .findById(id);

        verify(userMapper)
                .toDTO(user);
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExist() {

        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> userService.findUserById(id)
                );

        assertEquals(
                "Usuário não encontrado",
                exception.getMessage()
        );

        verify(userMapper, never())
                .toDTO(any());
    }


    // =========================================================
    // FIND ALL USERS
    // =========================================================

    @Test
    void shouldFindAllUsersSuccessfully() {

        Pageable pageable = mock(Pageable.class);

        User user1 = new User();
        User user2 = new User();

        UserResponseDTO response1 = mock(UserResponseDTO.class);
        UserResponseDTO response2 = mock(UserResponseDTO.class);

        Page<User> page = new PageImpl<>(
                List.of(user1, user2)
        );

        when(userRepository.findAll(pageable))
                .thenReturn(page);

        when(userMapper.toDTO(user1))
                .thenReturn(response1);

        when(userMapper.toDTO(user2))
                .thenReturn(response2);

        Page<UserResponseDTO> result =
                userService.findAllUsers(pageable);

        assertEquals(2, result.getTotalElements());
        assertEquals(
                response1,
                result.getContent().get(0)
        );
        assertEquals(
                response2,
                result.getContent().get(1)
        );

        verify(userRepository)
                .findAll(pageable);

        verify(userMapper)
                .toDTO(user1);

        verify(userMapper)
                .toDTO(user2);
    }


    // =========================================================
    // UPDATE USER
    // =========================================================

    @Test
    void shouldUpdateUserSuccessfully() {

        UUID id = UUID.randomUUID();

        UserUpdateDTO request = mock(UserUpdateDTO.class);
        User user = new User();
        User updatedUser = new User();
        UserResponseDTO response = mock(UserResponseDTO.class);

        user.setEmail("luan@finflow.com");

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        when(request.email())
                .thenReturn("luan@finflow.com");

        when(request.password())
                .thenReturn("12345678");

        when(passwordEncoder.encode("12345678"))
                .thenReturn("encoded-password");

        when(userRepository.save(user))
                .thenReturn(updatedUser);

        when(userMapper.toDTO(updatedUser))
                .thenReturn(response);

        UserResponseDTO result =
                userService.updateUser(id, request);

        assertSame(response, result);

        assertEquals(
                "encoded-password",
                user.getPassword()
        );

        verify(userMapper)
                .updateEntity(request, user);

        verify(passwordEncoder)
                .encode("12345678");

        verify(userRepository)
                .save(user);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingUser() {

        UUID id = UUID.randomUUID();

        UserUpdateDTO request = mock(UserUpdateDTO.class);

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> userService.updateUser(id, request)
                );

        assertEquals(
                "Usuário não encontrado",
                exception.getMessage()
        );

        verify(userRepository, never())
                .save(any());

        verify(userMapper, never())
                .updateEntity(any(), any());
    }

    @Test
    void shouldThrowExceptionWhenUpdatingToExistingEmail() {

        UUID id = UUID.randomUUID();

        UserUpdateDTO request = mock(UserUpdateDTO.class);
        User user = new User();

        user.setEmail("old@finflow.com");

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        when(request.email())
                .thenReturn("existing@finflow.com");

        when(userRepository.existsByEmail(
                "existing@finflow.com"
        )).thenReturn(true);

        EmailAlreadyExistsException exception =
                assertThrows(
                        EmailAlreadyExistsException.class,
                        () -> userService.updateUser(id, request)
                );

        assertEquals(
                "existing@finflow.com",
                exception.getMessage()
        );

        verify(userRepository)
                .existsByEmail("existing@finflow.com");

        verify(userMapper, never())
                .updateEntity(any(), any());

        verify(userRepository, never())
                .save(any());
    }


    // =========================================================
    // DELETE USER BY ADMIN
    // =========================================================

    @Test
    void shouldDeleteUserByAdminSuccessfully() {

        UUID id = UUID.randomUUID();

        User user = new User();

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        userService.deleteUserByAdmin(id);

        verify(userRepository)
                .findById(id);

        verify(userRepository)
                .delete(user);
    }

    @Test
    void shouldThrowExceptionWhenAdminDeletesNonExistingUser() {

        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> userService.deleteUserByAdmin(id)
                );

        assertEquals(
                "Usuário não encontrado",
                exception.getMessage()
        );

        verify(userRepository, never())
                .delete(any());
    }


    // =========================================================
    // DELETE OWN USER
    // =========================================================

    @Test
    void shouldDeleteOwnUserSuccessfully() {

        UUID id = UUID.randomUUID();

        User user = new User();

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        userService.deleteOwnUser(id);

        verify(userRepository)
                .findById(id);

        verify(userRepository)
                .delete(user);
    }

    @Test
    void shouldThrowExceptionWhenOwnUserDoesNotExist() {

        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> userService.deleteOwnUser(id)
                );

        assertEquals(
                "Usuário não encontrado",
                exception.getMessage()
        );

        verify(userRepository, never())
                .delete(any());
    }
}

