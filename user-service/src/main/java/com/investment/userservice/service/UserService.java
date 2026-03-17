package com.investment.userservice.service;

import com.investment.userservice.entity.User;
import com.investment.userservice.entity.UserRole;
import com.investment.userservice.exception.ConflictException;
import com.investment.userservice.exception.NotFoundException;
import com.investment.userservice.repository.RoleRepository;
import com.investment.userservice.repository.UserRepository;
import com.investment.userservice.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String login, String password, String email) {

        if (userRepository.existsByLogin(login)) {
            throw new ConflictException("Login already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        User user = new User();

        user.setLogin(login);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));

        return userRepository.save(user);
    }

    public User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User findByLogin(String login) {
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public void assignRole(UUID userId, String roleName) {
        User user = getUser(userId);
        var role = roleRepository.findByName(roleName.toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new NotFoundException("Role not found"));

        // Replace existing roles with the new one (no-op if already assigned as the only role)
        List<UserRole> existing = userRoleRepository.findByUserId(userId);
        if (existing.size() == 1 && existing.get(0).getRoleId().equals(role.getId())) {
            return;
        }

        userRoleRepository.deleteByUserId(userId);
        userRoleRepository.flush();

        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRoleRepository.save(userRole);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<String> getRoleNamesForUser(UUID userId) {
        return userRoleRepository.findByUserId(userId)
                .stream()
                .map(ur -> roleRepository.findById(ur.getRoleId()).map(r -> r.getName()).orElse(""))
                .filter(name -> !name.isBlank())
                .collect(Collectors.toList());
    }

    public void setActive(UUID userId, boolean active) {
        User user = getUser(userId);
        user.setActive(active);
        userRepository.save(user);
    }

    public void changePassword(String login, String currentPassword, String newPassword) {
        User user = findByLogin(login);
        if (!user.isActive()) {
            throw new ForbiddenException("User is blocked");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ConflictException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String resetPassword(UUID userId) {
        User user = getUser(userId);
        String newPassword = generateTemporaryPassword(12);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return newPassword;
    }

    private String generateTemporaryPassword(int length) {
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
