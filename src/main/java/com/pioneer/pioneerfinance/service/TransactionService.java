package com.pioneer.pioneerfinance.service;

import com.pioneer.pioneerfinance.dto.DashboardResponse;
import com.pioneer.pioneerfinance.exception.TransactionNotFoundException;
import com.pioneer.pioneerfinance.model.Account;
import com.pioneer.pioneerfinance.model.AccountType;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.model.TransactionType;
import com.pioneer.pioneerfinance.model.User;
import com.pioneer.pioneerfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;
    private final AccountService accountService;

    public TransactionService(
            TransactionRepository repository,
            AccountService accountService
    ) {
        this.repository = repository;
        this.accountService = accountService;
    }

    public List<Transaction> getAllTransactions(User user) {
        return repository.findAllByUser(user);
    }

    public Transaction getTransactionById(
            Long id,
            User user
    ) {
        return repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new TransactionNotFoundException(id));
    }

    @Transactional
    public Transaction saveTransaction(
            Transaction transaction,
            User user
    ) {
        transaction.setUser(user);

        if (transaction.getType() == TransactionType.TRANSFER) {

            prepareAndApplyTransfer(
                    transaction,
                    user
            );

        } else {

            prepareAndApplyStandardTransaction(
                    transaction,
                    user
            );
        }

        return repository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(
            Long id,
            Transaction updatedTransaction,
            User user
    ) {
        Transaction existingTransaction =
                getTransactionById(id, user);

        // Reverse the old transaction before applying the edited version.
        reverseExistingTransaction(existingTransaction);

        existingTransaction.setDescription(
                updatedTransaction.getDescription()
        );

        existingTransaction.setAmount(
                updatedTransaction.getAmount()
        );

        existingTransaction.setCategory(
                updatedTransaction.getCategory()
        );

        existingTransaction.setDate(
                updatedTransaction.getDate()
        );

        existingTransaction.setType(
                updatedTransaction.getType()
        );

        if (updatedTransaction.getType() == TransactionType.TRANSFER) {

            existingTransaction.setAccount(
                    updatedTransaction.getAccount()
            );

            existingTransaction.setDestinationAccount(
                    updatedTransaction.getDestinationAccount()
            );

            prepareAndApplyTransfer(
                    existingTransaction,
                    user
            );

        } else {

            existingTransaction.setAccount(
                    updatedTransaction.getAccount()
            );

            existingTransaction.setDestinationAccount(null);

            prepareAndApplyStandardTransaction(
                    existingTransaction,
                    user
            );
        }

        return repository.save(existingTransaction);
    }

    @Transactional
    public void deleteTransaction(
            Long id,
            User user
    ) {
        Transaction transaction =
                getTransactionById(id, user);

        reverseExistingTransaction(transaction);

        repository.delete(transaction);
    }

    public DashboardResponse getDashboard(User user) {

        List<Transaction> transactions =
                getAllTransactions(user);

        List<Account> accounts =
                accountService.getAccounts(user);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal balance = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {

            if (transaction.getType() == TransactionType.INCOME) {

                totalIncome =
                        totalIncome.add(
                                transaction.getAmount()
                        );

            } else if (
                    transaction.getType()
                            == TransactionType.EXPENSE
            ) {

                totalExpenses =
                        totalExpenses.add(
                                transaction.getAmount()
                        );
            }

            // TRANSFER is intentionally ignored here.
            // Moving money between your own accounts is
            // neither income nor an expense.
        }

        for (Account account : accounts) {

            if (account.getType() == AccountType.CHECKING
                    || account.getType() == AccountType.SAVINGS
                    || account.getType() == AccountType.CASH) {

                balance =
                        balance.add(
                                account.getBalance()
                        );
            }
        }

        return new DashboardResponse(
                totalIncome,
                totalExpenses,
                balance
        );
    }

    private void prepareAndApplyStandardTransaction(
            Transaction transaction,
            User user
    ) {

        transaction.setDestinationAccount(null);

        if (transaction.getAccount() != null
                && transaction.getAccount().getId() != null) {

            Account account =
                    accountService.getAccount(
                            transaction.getAccount().getId(),
                            user
                    );

            transaction.setAccount(account);

            applyStandardTransactionToAccount(
                    account,
                    transaction.getAmount(),
                    transaction.getType()
            );

        } else {

            transaction.setAccount(null);
        }
    }

    private void prepareAndApplyTransfer(
            Transaction transaction,
            User user
    ) {

        if (transaction.getAccount() == null
                || transaction.getAccount().getId() == null) {

            throw new IllegalArgumentException(
                    "A transfer requires a source account."
            );
        }

        if (transaction.getDestinationAccount() == null
                || transaction.getDestinationAccount().getId() == null) {

            throw new IllegalArgumentException(
                    "A transfer requires a destination account."
            );
        }

        Long sourceAccountId =
                transaction.getAccount().getId();

        Long destinationAccountId =
                transaction.getDestinationAccount().getId();

        if (sourceAccountId.equals(destinationAccountId)) {

            throw new IllegalArgumentException(
                    "Source and destination accounts must be different."
            );
        }

        Account sourceAccount =
                accountService.getAccount(
                        sourceAccountId,
                        user
                );

        Account destinationAccount =
                accountService.getAccount(
                        destinationAccountId,
                        user
                );

        transaction.setAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);

        applyTransferFromSource(
                sourceAccount,
                transaction.getAmount()
        );

        applyTransferToDestination(
                destinationAccount,
                transaction.getAmount()
        );
    }

    private void reverseExistingTransaction(
            Transaction transaction
    ) {

        if (transaction.getType() == TransactionType.TRANSFER) {

            if (transaction.getAccount() != null) {

                reverseTransferFromSource(
                        transaction.getAccount(),
                        transaction.getAmount()
                );
            }

            if (transaction.getDestinationAccount() != null) {

                reverseTransferToDestination(
                        transaction.getDestinationAccount(),
                        transaction.getAmount()
                );
            }

        } else {

            if (transaction.getAccount() != null) {

                reverseStandardTransactionFromAccount(
                        transaction.getAccount(),
                        transaction.getAmount(),
                        transaction.getType()
                );
            }
        }
    }

    private void applyStandardTransactionToAccount(
            Account account,
            BigDecimal amount,
            TransactionType type
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            if (type == TransactionType.EXPENSE) {

                account.addToBalance(amount);

            } else if (type == TransactionType.INCOME) {

                account.subtractFromBalance(amount);
            }

            return;
        }

        if (type == TransactionType.INCOME) {

            account.addToBalance(amount);

        } else if (type == TransactionType.EXPENSE) {

            account.subtractFromBalance(amount);
        }
    }

    private void reverseStandardTransactionFromAccount(
            Account account,
            BigDecimal amount,
            TransactionType type
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            if (type == TransactionType.EXPENSE) {

                account.subtractFromBalance(amount);

            } else if (type == TransactionType.INCOME) {

                account.addToBalance(amount);
            }

            return;
        }

        if (type == TransactionType.INCOME) {

            account.subtractFromBalance(amount);

        } else if (type == TransactionType.EXPENSE) {

            account.addToBalance(amount);
        }
    }

    private void applyTransferFromSource(
            Account account,
            BigDecimal amount
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            // Example: cash advance from a credit card.
            // The amount owed increases.
            account.addToBalance(amount);

        } else {

            // Money leaves Checking, Savings, or Cash.
            account.subtractFromBalance(amount);
        }
    }

    private void applyTransferToDestination(
            Account account,
            BigDecimal amount
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            // Paying a credit card reduces the amount owed.
            account.subtractFromBalance(amount);

        } else {

            // Money enters Checking, Savings, or Cash.
            account.addToBalance(amount);
        }
    }

    private void reverseTransferFromSource(
            Account account,
            BigDecimal amount
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            account.subtractFromBalance(amount);

        } else {

            account.addToBalance(amount);
        }
    }

    private void reverseTransferToDestination(
            Account account,
            BigDecimal amount
    ) {

        if (account.getType() == AccountType.CREDIT_CARD) {

            account.addToBalance(amount);

        } else {

            account.subtractFromBalance(amount);
        }
    }
}