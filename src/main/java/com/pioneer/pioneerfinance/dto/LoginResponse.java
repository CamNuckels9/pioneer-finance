package com.pioneer.pioneerfinance.dto;

public record LoginResponse(
        String message,
        String token,
        Long id,
        String firstName,
        String lastName,
        String email
) {
}