package com.pioneer.pioneerfinance.controller;

import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class HomeController {

    private final TransactionService service;

    public HomeController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> getTransactions() {
        return service.getAllTransactions();
    }

    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Long id) {
        return service.getTransactionById(id);
    }

    @PostMapping
    public Transaction addTransaction(
            @Valid @RequestBody Transaction transaction
    ) {
        return service.saveTransaction(transaction);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody Transaction transaction
    ) {
        return service.updateTransaction(id, transaction);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        service.deleteTransaction(id);
    }
}