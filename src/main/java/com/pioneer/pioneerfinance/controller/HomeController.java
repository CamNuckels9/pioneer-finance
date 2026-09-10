package com.pioneer.pioneerfinance.controller;

import com.pioneer.pioneerfinance.dto.DashboardResponse;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.model.User;
import com.pioneer.pioneerfinance.service.TransactionService;
import com.pioneer.pioneerfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class HomeController {

    private final TransactionService transactionService;
    private final UserService userService;

    public HomeController(
            TransactionService transactionService,
            UserService userService
    ) {
        this.transactionService = transactionService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        List<Transaction> transactions =
                transactionService.getAllTransactions(user);

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Transaction transaction =
                transactionService.getTransactionById(id, user);

        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        DashboardResponse dashboard =
                transactionService.getDashboard(user);

        return ResponseEntity.ok(dashboard);
    }

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @Valid @RequestBody Transaction transaction,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Transaction savedTransaction =
                transactionService.saveTransaction(transaction, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody Transaction updatedTransaction,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Transaction transaction =
                transactionService.updateTransaction(
                        id,
                        updatedTransaction,
                        user
                );

        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        transactionService.deleteTransaction(id, user);

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }
}