package com.investment.userservice.controller;

import com.investment.userservice.dto.CreateUserRequest;
import com.investment.userservice.dto.ResetPasswordResponse;
import com.investment.userservice.dto.UserResponse;
import com.investment.userservice.entity.User;
import com.investment.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return toUserResponse(userService.getUser(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request.getLogin(), request.getPassword(), request.getEmail());
        if (request.getRoles() != null) {
            for (String role : request.getRoles()) {
                if (role != null && !role.isBlank()) {
                    userService.assignRole(user.getId(), role);
                    break;
                }
            }
        }
        return toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/roles/{roleName}")
    public void assignRole(@PathVariable UUID userId, @PathVariable String roleName) {
        userService.assignRole(userId, roleName);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/block")
    public void blockUser(@PathVariable UUID userId) {
        userService.setActive(userId, false);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/unblock")
    public void unblockUser(@PathVariable UUID userId) {
        userService.setActive(userId, true);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/reset-password")
    public ResetPasswordResponse resetPassword(@PathVariable UUID userId) {
        String tempPassword = userService.resetPassword(userId);
        return new ResetPasswordResponse(userId, tempPassword);
    }

    private UserResponse toUserResponse(User user) {
        List<String> roles = userService.getRoleNamesForUser(user.getId());
        return new UserResponse(user.getId(), user.getLogin(), user.getEmail(), user.isActive(), user.getCreatedAt(), roles);
    }
}
