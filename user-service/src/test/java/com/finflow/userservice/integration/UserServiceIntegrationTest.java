package com.finflow.userservice.integration;

import com.finflow.userservice.exception.EmailAlreadyExistsException;
import com.finflow.userservice.exception.InvalidCredentialsException;
import com.finflow.userservice.exception.ResourceNotFoundException;
import com.finflow.userservice.model.Role;
import com.finflow.userservice.model.User;
import com.finflow.userservice.repository.UserRepository;
import com.finflow.userservice.service.UserService;
import com.finflow.userservice.tdo.LoginRequestDTO;
import com.finflow.userservice.tdo.LoginResponseDTO;
import com.finflow.userservice.tdo.UserRequestDTO;
import com.finflow.userservice.tdo.UserResponseDTO;
import com.finflow.userservice.tdo.UserUpdateDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Import;
import com.finflow.userservice.TestcontainersConfiguration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)

class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldCreateUserSuccessfully() {

        UserRequestDTO request = new UserRequestDTO(
                "Luan",
                "luan@finflow.com",
                "12345678"
        );

        UserResponseDTO response = userService.createUser(request);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Luan");
        assertThat(response.email()).isEqualTo("luan@finflow.com");

        User user = userRepository.findByEmail("luan@finflow.com")
                .orElseThrow();

        assertThat(user.getPassword())
                .isNotEqualTo("12345678");

        assertThat(
                passwordEncoder.matches(
                        "12345678",
                        user.getPassword()
                )
        ).isTrue();

        assertThat(user.getRole())
                .isEqualTo(Role.USER);
    }

    @Test
    void shouldNotCreateUserWithExistingEmail() {

        User existingUser = createUser();

        userRepository.save(existingUser);

        UserRequestDTO request = new UserRequestDTO(
                "Outro Usuário",
                "luan@finflow.com",
                "12345678"
        );

        assertThatThrownBy(() ->
                userService.createUser(request)
        )
                .isInstanceOf(EmailAlreadyExistsException.class);
    }

    @Test
    void shouldLoginSuccessfully() {

        User user = createUser();

        user.setPassword(
                passwordEncoder.encode("12345678")
        );

        userRepository.save(user);

        LoginRequestDTO request = new LoginRequestDTO(
                "luan@finflow.com",
                "12345678"
        );

        LoginResponseDTO response =
                userService.loginUser(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isNotBlank();
        assertThat(response.type()).isEqualTo("Bearer");
    }

    @Test
    void shouldRejectWrongPassword() {

        User user = createUser();

        user.setPassword(
                passwordEncoder.encode("12345678")
        );

        userRepository.save(user);

        LoginRequestDTO request = new LoginRequestDTO(
                "luan@finflow.com",
                "wrong-password"
        );

        assertThatThrownBy(() ->
                userService.loginUser(request)
        )
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void shouldFindUserById() {

        User savedUser =
                userRepository.save(createUser());

        UserResponseDTO response =
                userService.findUserById(savedUser.getId());

        assertThat(response.id())
                .isEqualTo(savedUser.getId());

        assertThat(response.email())
                .isEqualTo("luan@finflow.com");
    }

    @Test
    void shouldFindAllUsers() {

        userRepository.save(
                createUser(
                        "Luan",
                        "luan@finflow.com"
                )
        );

        userRepository.save(
                createUser(
                        "Maria",
                        "maria@finflow.com"
                )
        );

        var result = userService.findAllUsers(
                PageRequest.of(0, 10)
        );

        assertThat(result.getTotalElements())
                .isEqualTo(2);
    }

    @Test
    void shouldUpdateUser() {

        User user =
                userRepository.save(createUser());

        UserUpdateDTO request = new UserUpdateDTO(
                "Luan Atualizado",
                "novo@finflow.com",
                "novasenha123"
        );

        UserResponseDTO response =
                userService.updateUser(
                        user.getId(),
                        request
                );

        assertThat(response.name())
                .isEqualTo("Luan Atualizado");

        assertThat(response.email())
                .isEqualTo("novo@finflow.com");

        User updated =
                userRepository.findById(user.getId())
                        .orElseThrow();

        assertThat(
                passwordEncoder.matches(
                        "novasenha123",
                        updated.getPassword()
                )
        ).isTrue();
    }

    @Test
    void shouldDeleteUser() {

        User user =
                userRepository.save(createUser());

        userService.deleteOwnUser(user.getId());

        assertThat(
                userRepository.findById(user.getId())
        ).isEmpty();
    }

    @Test
    void shouldThrowWhenFindingNonExistingUser() {

        UUID id = UUID.randomUUID();

        assertThatThrownBy(() ->
                userService.findUserById(id)
        )
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private User createUser() {
        return createUser(
                "Luan",
                "luan@finflow.com"
        );
    }

    private User createUser(
            String name,
            String email
    ) {
        User user = new User();

        user.setId(UUID.randomUUID());
        user.setName(name);
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setRole(Role.USER);

        return user;
    }
}
