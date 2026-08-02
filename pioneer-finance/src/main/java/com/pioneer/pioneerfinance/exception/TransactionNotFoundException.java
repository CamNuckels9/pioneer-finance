package com.pioneer.pioneerfinance.exception;

public class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(Long id) {
        super("Transaction not found with id: " + id);
    }
}