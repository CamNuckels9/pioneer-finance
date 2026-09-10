package com.pioneer.pioneerfinance.repository;

import com.pioneer.pioneerfinance.model.Account;
import com.pioneer.pioneerfinance.model.Transaction;
import com.pioneer.pioneerfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByUser(User user);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    boolean existsByAccount(Account account);

    boolean existsByDestinationAccount(Account account);
}