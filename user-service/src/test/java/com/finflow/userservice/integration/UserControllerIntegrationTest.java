package com.finflow.userservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finflow.userservice.model.Role;
import com.finflow.userservice.model.User;
import com.finflow.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import com.finflow.userservice.TestcontainersConfiguration;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUser() throws Exception {

        String json = """
                {
                    "name": "Luan",
                    "email": "luan@finflow.com",
                    "password": "12345678"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name")
                        .value("Luan"))
                .andExpect(jsonPath("$.email")
                        .value("luan@finflow.com"));
    }

    @Test
    void shouldLoginUser() throws Exception {

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String json = """
            {
                "email": "luan@finflow.com",
                "password": "12345678"
            }
            """;

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token")
                        .isNotEmpty())
                .andExpect(jsonPath("$.type")
                        .value("Bearer"));
    }

    @Test
    void shouldRejectLoginWithWrongPassword() throws Exception {

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String json = """
                {
                    "email": "luan@finflow.com",
                    "password": "wrong-password"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldGetOwnUser() throws Exception {

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token = login(
                "luan@finflow.com",
                "12345678"
        );

        mockMvc.perform(
                        get("/api/users/me")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Luan"))
                .andExpect(jsonPath("$.email")
                        .value("luan@finflow.com"));
    }

    @Test
    void shouldRejectUnauthenticatedAccess() throws Exception {

        mockMvc.perform(
                        get("/api/users/me")
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAdminToFindUserById() throws Exception {

        User admin = createUser(
                "Admin",
                "admin@finflow.com",
                "12345678",
                Role.ADMIN
        );

        User user = createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("admin@finflow.com", "12345678");

        mockMvc.perform(
                        get("/api/users/" + user.getId())
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email")
                        .value("luan@finflow.com"));
    }

    @Test
    void shouldRejectNormalUserFromFindingUserById() throws Exception {

        User target = createUser(
                "Maria",
                "maria@finflow.com",
                "12345678",
                Role.USER
        );

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("luan@finflow.com", "12345678");

        mockMvc.perform(
                        get("/api/users/" + target.getId())
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminToListUsers() throws Exception {

        createUser(
                "Admin",
                "admin@finflow.com",
                "12345678",
                Role.ADMIN
        );

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("admin@finflow.com", "12345678");

        mockMvc.perform(
                        get("/api/users")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content")
                        .isArray())
                .andExpect(jsonPath("$.totalElements")
                        .value(2));
    }

    @Test
    void shouldAllowAdminToUpdateUser() throws Exception {

        createUser(
                "Admin",
                "admin@finflow.com",
                "12345678",
                Role.ADMIN
        );

        User user = createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("admin@finflow.com", "12345678");

        String json = """
                {
                    "name": "Luan Atualizado",
                    "email": "novo@finflow.com",
                    "password": "novasenha123"
                }
                """;

        mockMvc.perform(
                        put("/api/users/" + user.getId())
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Luan Atualizado"))
                .andExpect(jsonPath("$.email")
                        .value("novo@finflow.com"));
    }

    @Test
    void shouldAllowUserToUpdateOwnData() throws Exception {

        User user = createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("luan@finflow.com", "12345678");

        String json = """
                {
                    "name": "Luan Novo",
                    "email": "novo@finflow.com",
                    "password": "novasenha123"
                }
                """;

        mockMvc.perform(
                        put("/api/users/me")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Luan Novo"))
                .andExpect(jsonPath("$.email")
                        .value("novo@finflow.com"));
    }

    @Test
    void shouldAllowUserToDeleteOwnAccount() throws Exception {

        User user = createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("luan@finflow.com", "12345678");

        mockMvc.perform(
                        delete("/api/users/me")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isNoContent());

        org.assertj.core.api.Assertions.assertThat(
                userRepository.findById(user.getId())
        ).isEmpty();
    }

    @Test
    void shouldAllowAdminToDeleteUser() throws Exception {

        createUser(
                "Admin",
                "admin@finflow.com",
                "12345678",
                Role.ADMIN
        );

        User user = createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("admin@finflow.com", "12345678");

        mockMvc.perform(
                        delete("/api/users/admin/" + user.getId())
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isNoContent());

        org.assertj.core.api.Assertions.assertThat(
                userRepository.findById(user.getId())
        ).isEmpty();
    }

    @Test
    void shouldRejectNormalUserFromDeletingAnotherUser() throws Exception {

        User target = createUser(
                "Maria",
                "maria@finflow.com",
                "12345678",
                Role.USER
        );

        createUser(
                "Luan",
                "luan@finflow.com",
                "12345678",
                Role.USER
        );

        String token =
                login("luan@finflow.com", "12345678");

        mockMvc.perform(
                        delete("/api/users/admin/" + target.getId())
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectInvalidRegistration() throws Exception {

        String json = """
                {
                    "name": "",
                    "email": "email-invalido",
                    "password": "123"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());
    }

    private User createUser(
            String name,
            String email,
            String password,
            Role role
    ) {

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(password)
        );
        user.setRole(role);

        return userRepository.save(user);
    }

    private String login(
            String email,
            String password
    ) throws Exception {

        String json = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        return objectMapper.readTree(
                mockMvc.perform(
                                post("/api/auth/login")
                                        .contentType(
                                                MediaType.APPLICATION_JSON
                                        )
                                        .content(json)
                        )
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString()
        ).get("token").asText();
    }
}