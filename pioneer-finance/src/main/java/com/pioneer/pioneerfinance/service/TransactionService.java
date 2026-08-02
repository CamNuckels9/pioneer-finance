package com.pioneer.pioneerfinance.service;

import com.pioneer.pioneerfinance.exception.TransactionNotFoundException;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    public Transaction getTransactionById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException(id));
    }

    public Transaction saveTransaction(Transaction transaction) {
        return repository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {

        Transaction existingTransaction = getTransactionById(id);

        existingTransaction.setDescription(updatedTransaction.getDescription());
        existingTransaction.setAmount(updatedTransaction.getAmount());
        existingTransaction.setCategory(updatedTransaction.getCategory());
        existingTransaction.setDate(updatedTransaction.getDate());
        existingTransaction.setType(updatedTransaction.getType());

        return repository.save(existingTransaction);
    }

    public void deleteTransaction(Long id) {

        Transaction transaction = getTransactionById(id);
        repository.delete(transaction);

    }
}