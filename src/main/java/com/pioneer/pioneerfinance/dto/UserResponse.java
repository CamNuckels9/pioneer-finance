package com.pioneer.pioneerfinance.dto;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email
) {
}