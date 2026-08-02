package com.pioneer.pioneerfinance.service;

import com.pioneer.pioneerfinance.exception.TransactionNotFoundException;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.model.TransactionType;
import com.pioneer.pioneerfinance.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    private TransactionService service;

    private Transaction transaction;

    @BeforeEach
    void setUp() {
        service = new TransactionService(repository);

        transaction = new Transaction();
        transaction.setDescription("Paycheck");
        transaction.setAmount(new BigDecimal("2500.00"));
        transaction.setCategory("Salary");
        transaction.setDate(LocalDate.of(2026, 8, 1));
        transaction.setType(TransactionType.INCOME);
    }

    @Test
    void getAllTransactionsReturnsTransactions() {
        when(repository.findAll()).thenReturn(List.of(transaction));

        List<Transaction> result = service.getAllTransactions();

        assertEquals(1, result.size());
        assertEquals("Paycheck", result.getFirst().getDescription());

        verify(repository).findAll();
    }

    @Test
    void getTransactionByIdReturnsTransactionWhenFound() {
        when(repository.findById(1L)).thenReturn(Optional.of(transaction));

        Transaction result = service.getTransactionById(1L);

        assertEquals("Paycheck", result.getDescription());
        assertEquals(new BigDecimal("2500.00"), result.getAmount());

        verify(repository).findById(1L);
    }

    @Test
    void getTransactionByIdThrowsExceptionWhenMissing() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        TransactionNotFoundException exception = assertThrows(
                TransactionNotFoundException.class,
                () -> service.getTransactionById(999L)
        );

        assertEquals(
                "Transaction not found with id: 999",
                exception.getMessage()
        );

        verify(repository).findById(999L);
    }

    @Test
    void saveTransactionSavesAndReturnsTransaction() {
        when(repository.save(transaction)).thenReturn(transaction);

        Transaction result = service.saveTransaction(transaction);

        assertSame(transaction, result);

        verify(repository).save(transaction);
    }

    @Test
    void deleteTransactionDeletesExistingTransaction() {
        when(repository.findById(1L)).thenReturn(Optional.of(transaction));

        service.deleteTransaction(1L);

        verify(repository).findById(1L);
        verify(repository).delete(transaction);
    }
}