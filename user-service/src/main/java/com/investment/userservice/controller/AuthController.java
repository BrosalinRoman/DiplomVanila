package com.investment.userservice.controller;

import com.investment.userservice.dto.AuthResponse;
import com.investment.userservice.dto.ChangePasswordRequest;
import com.investment.userservice.dto.LoginRequest;
import com.investment.userservice.dto.RegisterRequest;
import com.investment.userservice.dto.UserResponse;
import com.investment.userservice.entity.User;
import com.investment.userservice.exception.ForbiddenException;
import com.investment.userservice.exception.NotFoundException;
import com.investment.userservice.exception.UnauthorizedException;
import com.investment.userservice.security.JwtService;
import com.investment.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {

        User user = userService.createUser(
                request.getLogin(),
                request.getPassword(),
                request.getEmail()
        );
        List<String> roles = userService.getRoleNamesForUser(user.getId());
        return new UserResponse(user.getId(), user.getLogin(), user.getEmail(), user.isActive(), user.getCreatedAt(), roles);

    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user;
        try {
            user = userService.findByLogin(request.getLogin());
        } catch (NotFoundException ex) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new ForbiddenException("User is blocked");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        List<String> roles = userService.getRoleNamesForUser(user.getId());
        return new AuthResponse(token, user.getId(), user.getLogin(), roles);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        String login = authentication.getName();
        userService.changePassword(login, request.getCurrentPassword(), request.getNewPassword());
    }

}
