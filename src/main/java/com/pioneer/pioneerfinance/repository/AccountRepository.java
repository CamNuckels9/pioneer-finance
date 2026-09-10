package com.pioneer.pioneerfinance.repository;

import com.pioneer.pioneerfinance.model.Account;
import com.pioneer.pioneerfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserOrderByNameAsc(User user);

    Optional<Account> findByIdAndUser(Long id, User user);
}