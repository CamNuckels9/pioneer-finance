package com.pioneer.pioneerfinance.controller;

import com.pioneer.pioneerfinance.exception.TransactionNotFoundException;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.model.TransactionType;
import com.pioneer.pioneerfinance.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HomeController.class)
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService service;

    private Transaction transaction;

    @BeforeEach
    void setUp() {
        transaction = new Transaction();
        transaction.setDescription("Paycheck");
        transaction.setAmount(new BigDecimal("2500.00"));
        transaction.setCategory("Salary");
        transaction.setDate(LocalDate.of(2026, 8, 1));
        transaction.setType(TransactionType.INCOME);
    }

    @Test
    void getTransactionsReturnsTransactions() throws Exception {
        when(service.getAllTransactions())
                .thenReturn(List.of(transaction));

        mockMvc.perform(get("/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Paycheck"))
                .andExpect(jsonPath("$[0].amount").value(2500.00))
                .andExpect(jsonPath("$[0].category").value("Salary"))
                .andExpect(jsonPath("$[0].type").value("INCOME"));

        verify(service).getAllTransactions();
    }

    @Test
    void getTransactionByIdReturnsTransaction() throws Exception {
        when(service.getTransactionById(1L))
                .thenReturn(transaction);

        mockMvc.perform(get("/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Paycheck"))
                .andExpect(jsonPath("$.amount").value(2500.00))
                .andExpect(jsonPath("$.type").value("INCOME"));

        verify(service).getTransactionById(1L);
    }

    @Test
    void getMissingTransactionReturns404() throws Exception {
        when(service.getTransactionById(999L))
                .thenThrow(new TransactionNotFoundException(999L));

        mockMvc.perform(get("/transactions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Transaction not found with id: 999"));

        verify(service).getTransactionById(999L);
    }

    @Test
    void addTransactionReturnsSavedTransaction() throws Exception {
        when(service.saveTransaction(any(Transaction.class)))
                .thenReturn(transaction);

        String json = """
                {
                  "description": "Paycheck",
                  "amount": 2500.00,
                  "category": "Salary",
                  "date": "2026-08-01",
                  "type": "INCOME"
                }
                """;

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Paycheck"))
                .andExpect(jsonPath("$.amount").value(2500.00))
                .andExpect(jsonPath("$.type").value("INCOME"));

        verify(service).saveTransaction(any(Transaction.class));
    }

    @Test
    void addInvalidTransactionReturns400() throws Exception {
        String invalidJson = """
                {
                  "description": "",
                  "amount": -500,
                  "category": "",
                  "date": null,
                  "type": null
                }
                """;

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath(
                        "$.validationErrors.description"
                ).value("Description is required"))
                .andExpect(jsonPath(
                        "$.validationErrors.amount"
                ).value("Amount must be greater than zero"))
                .andExpect(jsonPath(
                        "$.validationErrors.category"
                ).value("Category is required"))
                .andExpect(jsonPath(
                        "$.validationErrors.date"
                ).value("Date is required"))
                .andExpect(jsonPath(
                        "$.validationErrors.type"
                ).value("Transaction type is required"));

        verifyNoInteractions(service);
    }

    @Test
    void updateTransactionReturnsUpdatedTransaction() throws Exception {
        transaction.setAmount(new BigDecimal("2750.00"));

        when(service.updateTransaction(
                eq(1L),
                any(Transaction.class)
        )).thenReturn(transaction);

        String json = """
                {
                  "description": "Paycheck",
                  "amount": 2750.00,
                  "category": "Salary",
                  "date": "2026-08-01",
                  "type": "INCOME"
                }
                """;

        mockMvc.perform(put("/transactions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(2750.00));

        verify(service).updateTransaction(
                eq(1L),
                any(Transaction.class)
        );
    }

    @Test
    void deleteTransactionReturns200() throws Exception {
        doNothing().when(service).deleteTransaction(1L);

        mockMvc.perform(delete("/transactions/1"))
                .andExpect(status().isOk());

        verify(service).deleteTransaction(1L);
    }
}