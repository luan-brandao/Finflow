package com.finflow.userservice.integration;

import com.finflow.userservice.TestcontainersConfiguration;
import com.finflow.userservice.model.Role;
import com.finflow.userservice.model.User;
import com.finflow.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class UserRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldSaveAndFindUserById() {
        User user = createUser(
                "Luan",
                "luan@finflow.com"
        );

        User savedUser = userRepository.save(user);

        Optional<User> result =
                userRepository.findById(savedUser.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Luan");
        assertThat(result.get().getEmail())
                .isEqualTo("luan@finflow.com");
    }

    @Test
    void shouldFindUserByEmail() {
        User user = createUser(
                "Luan",
                "luan@finflow.com"
        );

        userRepository.save(user);

        Optional<User> result =
                userRepository.findByEmail("luan@finflow.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail())
                .isEqualTo("luan@finflow.com");
    }

    @Test
    void shouldReturnEmptyWhenEmailDoesNotExist() {
        Optional<User> result =
                userRepository.findByEmail("notfound@finflow.com");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldCheckIfEmailExists() {
        User user = createUser(
                "Luan",
                "luan@finflow.com"
        );

        userRepository.save(user);

        assertThat(
                userRepository.existsByEmail("luan@finflow.com")
        ).isTrue();

        assertThat(
                userRepository.existsByEmail("other@finflow.com")
        ).isFalse();
    }

    @Test
    void shouldDeleteUser() {
        User user = createUser(
                "Luan",
                "luan@finflow.com"
        );

        User savedUser = userRepository.save(user);

        userRepository.delete(savedUser);

        assertThat(
                userRepository.findById(savedUser.getId())
        ).isEmpty();
    }

    private User createUser(String name, String email) {
        User user = new User();

        user.setId(UUID.randomUUID());
        user.setName(name);
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setRole(Role.USER);

        return user;
    }
}