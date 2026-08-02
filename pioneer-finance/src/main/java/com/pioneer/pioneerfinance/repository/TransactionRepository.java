package com.pioneer.pioneerfinance.repository;

import com.pioneer.pioneerfinance.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

}