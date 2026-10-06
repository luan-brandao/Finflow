package com.finflow.financeservice.integration;

import com.finflow.financeservice.TestcontainersConfiguration;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.model.Category;
import com.finflow.financeservice.model.Goal;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.repository.GoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class FinanceRepositoryIntegrationTest {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        cardRepository.deleteAll();
        goalRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    @Test
    void shouldSaveAndFindCard() {
        Card card = new Card();
        card.setUserId(userId);
        card.setName("Nubank Ultravioleta");
        card.setCreditLimit(new BigDecimal("10000.00"));
        card.setDueDay(15);
        card.setPrepaidAmount(BigDecimal.ZERO);

        Card saved = cardRepository.save(card);

        Optional<Card> result = cardRepository.findByIdAndUserId(saved.getId(), userId);
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Nubank Ultravioleta");
        assertThat(result.get().getCreditLimit()).isEqualByComparingTo("10000.00");
    }

    @Test
    void shouldSaveAndFindGoal() {
        Goal goal = new Goal();
        goal.setUserId(userId);
        goal.setTitle("Viagem Orlando");
        goal.setTargetAmount(new BigDecimal("20000.00"));
        goal.setCurrentAmount(new BigDecimal("2000.00"));
        goal.setStatus("ACTIVE");
        goal.setTargetDate(LocalDate.now().plusYears(1));

        Goal saved = goalRepository.save(goal);

        Optional<Goal> result = goalRepository.findById(saved.getId());
        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Viagem Orlando");
    }

    @Test
    void shouldFindDefaultCategoriesAndUserCategories() {
        Category defaultCategory = new Category();
        defaultCategory.setName("Alimentação");
        defaultCategory.setUserId(null);
        defaultCategory.setDefault(true);
        categoryRepository.save(defaultCategory);

        Category userCategory = new Category();
        userCategory.setName("Hobbies Luan");
        userCategory.setUserId(userId);
        userCategory.setDefault(false);
        categoryRepository.save(userCategory);

        List<Category> list = categoryRepository.findByUserIdIsNullOrUserId(userId);
        assertThat(list).hasSize(2);
    }
}
