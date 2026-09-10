package com.pioneer.pioneerfinance.service;

import com.pioneer.pioneerfinance.exception.AccountHasTransactionsException;
import com.pioneer.pioneerfinance.model.Account;
import com.pioneer.pioneerfinance.model.User;
import com.pioneer.pioneerfinance.repository.AccountRepository;
import com.pioneer.pioneerfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Account> getAccounts(User user) {
        return accountRepository.findByUserOrderByNameAsc(user);
    }

    public Account getAccount(Long id, User user) {
        return accountRepository.findByIdAndUser(id, user)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Account not found."
                        )
                );
    }

    public Account createAccount(
            Account account,
            User user
    ) {
        account.setUser(user);
        return accountRepository.save(account);
    }

    public Account updateAccount(
            Long id,
            Account updatedAccount,
            User user
    ) {
        Account existingAccount =
                getAccount(id, user);

        existingAccount.setName(
                updatedAccount.getName()
        );

        existingAccount.setType(
                updatedAccount.getType()
        );

        existingAccount.setBalance(
                updatedAccount.getBalance()
        );

        return accountRepository.save(existingAccount);
    }

    public void deleteAccount(
            Long id,
            User user
    ) {
        Account account =
                getAccount(id, user);

        boolean usedAsSource =
                transactionRepository.existsByAccount(
                        account
                );

        boolean usedAsDestination =
                transactionRepository.existsByDestinationAccount(
                        account
                );

        if (
                usedAsSource
                        || usedAsDestination
        ) {
            throw new AccountHasTransactionsException();
        }

        accountRepository.delete(account);
    }
}