package com.pioneer.pioneerfinance.exception;

public class AccountHasTransactionsException extends RuntimeException {

    public AccountHasTransactionsException() {
        super(
                "This account cannot be deleted because it has transactions associated with it."
        );
    }
}