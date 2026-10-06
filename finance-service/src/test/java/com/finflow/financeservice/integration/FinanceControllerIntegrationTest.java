package com.finflow.financeservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finflow.financeservice.TestcontainersConfiguration;
import com.finflow.financeservice.dto.CardRequestDTO;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.GoalRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class FinanceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CardInvoiceRepository cardInvoiceRepository;

    private UUID userId;
    private String token;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        token = generateTestToken(userId);
        transactionRepository.deleteAll();
        cardInvoiceRepository.deleteAll();
        cardRepository.deleteAll();
        goalRepository.deleteAll();
    }

    private String generateTestToken(UUID userId) {
        SecretKey secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode("SUCyqUK/gHFUSeNnni37KZHllM1w6+43ibwhqcXlloU=")
        );
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", "USER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    @Test
    void shouldCreateCardSuccessfully() throws Exception {
        CardRequestDTO request = new CardRequestDTO("Visa Infinite", new BigDecimal("15000.00"), 5);

        mockMvc.perform(
                        post("/api/cards")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Visa Infinite"))
                .andExpect(jsonPath("$.creditLimit").value(15000.00))
                .andExpect(jsonPath("$.dueDay").value(5));
    }

    @Test
    void shouldRejectUnauthenticatedAccess() throws Exception {
        mockMvc.perform(
                        get("/api/cards")
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnEmptyListWhenNoCardsExist() throws Exception {
        mockMvc.perform(
                        get("/api/cards")
                                .header("Authorization", "Bearer " + token)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
