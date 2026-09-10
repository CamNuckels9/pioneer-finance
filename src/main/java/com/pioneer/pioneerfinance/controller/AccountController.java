package com.pioneer.pioneerfinance.controller;

import com.pioneer.pioneerfinance.model.Account;
import com.pioneer.pioneerfinance.model.User;
import com.pioneer.pioneerfinance.service.AccountService;
import com.pioneer.pioneerfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    public AccountController(
            AccountService accountService,
            UserService userService
    ) {
        this.accountService = accountService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAccounts(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        List<Account> accounts =
                accountService.getAccounts(user);

        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Account account =
                accountService.getAccount(id, user);

        return ResponseEntity.ok(account);
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(
            @Valid @RequestBody Account account,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Account savedAccount =
                accountService.createAccount(account, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAccount);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody Account updatedAccount,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Account account =
                accountService.updateAccount(
                        id,
                        updatedAccount,
                        user
                );

        return ResponseEntity.ok(account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        accountService.deleteAccount(id, user);

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }
}