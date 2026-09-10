package com.pioneer.pioneerfinance.controller;

import com.pioneer.pioneerfinance.dto.LoginRequest;
import com.pioneer.pioneerfinance.dto.LoginResponse;
import com.pioneer.pioneerfinance.dto.UserResponse;
import com.pioneer.pioneerfinance.model.User;
import com.pioneer.pioneerfinance.service.JwtService;
import com.pioneer.pioneerfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody User user
    ) {
        User savedUser = userService.register(user);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        User user = userService.login(
                request.email(),
                request.password()
        );

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
                "Login successful",
                token,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}