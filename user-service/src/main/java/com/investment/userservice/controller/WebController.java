package com.investment.userservice.controller;

import com.investment.userservice.dto.UserTableRow;
import com.investment.userservice.entity.User;
import com.investment.userservice.exception.ForbiddenException;
import com.investment.userservice.exception.UnauthorizedException;
import com.investment.userservice.security.JwtService;
import com.investment.userservice.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/")
    public String home(HttpSession session) {
        if (session.getAttribute("token") != null) {
            return "redirect:/dashboard";
        }
        return "login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String login, @RequestParam String password,
                       HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByLogin(login);
            if (!user.isActive()) {
                throw new ForbiddenException("User is blocked");
            }
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new UnauthorizedException("Invalid credentials");
            }

            String token = jwtService.generateToken(user);
            List<String> roles = userService.getRoleNamesForUser(user.getId());

            session.setAttribute("token", token);
            session.setAttribute("user", login);
            session.setAttribute("roles", roles);
            return "redirect:/dashboard";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/login";
        }
    }

    @GetMapping("/register")
    public String registerPage() {
        return "redirect:/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        if (session.getAttribute("token") == null) {
            return "redirect:/login";
        }
        List<UserTableRow> users = userService.getAllUsers().stream()
                .map(user -> {
                    List<String> roles = userService.getRoleNamesForUser(user.getId());
                    String rolesDisplay = roles.isEmpty() ? "-" : String.join(", ", roles);
                    return new UserTableRow(
                            user.getId(),
                            user.getLogin(),
                            user.getEmail(),
                            user.isActive(),
                            user.getCreatedAt(),
                            rolesDisplay
                    );
                })
                .collect(Collectors.toList());
        model.addAttribute("users", users);
        model.addAttribute("user", session.getAttribute("user"));
        model.addAttribute("roles", session.getAttribute("roles"));
        return "dashboard";
    }

    @GetMapping("/password")
    public String changePasswordPage(HttpSession session) {
        if (session.getAttribute("token") == null) {
            return "redirect:/login";
        }
        return "change_password";
    }

    @PostMapping("/password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 HttpSession session,
                                 RedirectAttributes redirectAttributes) {
        if (session.getAttribute("token") == null) {
            return "redirect:/login";
        }
        try {
            String login = (String) session.getAttribute("user");
            userService.changePassword(login, currentPassword, newPassword);
            redirectAttributes.addFlashAttribute("success", "Password changed");
            return "redirect:/dashboard";
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
            return "redirect:/password";
        }
    }

    @GetMapping("/admin")
    public String adminPage(HttpSession session, Model model) {
        if (session.getAttribute("token") == null) {
            return "redirect:/login";
        }
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) session.getAttribute("roles");
        if (roles == null || !roles.contains("ADMIN")) {
            return "redirect:/dashboard";
        }

        List<UserTableRow> users = userService.getAllUsers().stream()
                .map(user -> {
                    List<String> userRoles = userService.getRoleNamesForUser(user.getId());
                    String rolesDisplay = userRoles.isEmpty() ? "-" : String.join(", ", userRoles);
                    return new UserTableRow(
                            user.getId(),
                            user.getLogin(),
                            user.getEmail(),
                            user.isActive(),
                            user.getCreatedAt(),
                            rolesDisplay
                    );
                })
                .collect(Collectors.toList());

        model.addAttribute("users", users);
        return "admin";
    }

    @PostMapping("/admin/users")
    public String adminCreateUser(@RequestParam String login,
                                  @RequestParam String email,
                                  @RequestParam String password,
                                  @RequestParam(required = false) String role,
                                  HttpSession session,
                                  RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            return "redirect:/dashboard";
        }
        try {
            User user = userService.createUser(login, password, email);
            if (role != null && !role.isBlank()) {
                userService.assignRole(user.getId(), role);
            }
            redirectAttributes.addFlashAttribute("success", "User created: " + user.getLogin());
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/users/assign-role")
    public String adminAssignRole(@RequestParam String userId,
                                  @RequestParam String role,
                                  HttpSession session,
                                  RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            return "redirect:/dashboard";
        }
        try {
            userService.assignRole(UUID.fromString(userId), role);
            redirectAttributes.addFlashAttribute("success", "Role assigned");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/users/{userId}/block")
    public String adminBlock(@PathVariable UUID userId, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            return "redirect:/dashboard";
        }
        userService.setActive(userId, false);
        redirectAttributes.addFlashAttribute("success", "User blocked");
        return "redirect:/admin";
    }

    @PostMapping("/admin/users/{userId}/unblock")
    public String adminUnblock(@PathVariable UUID userId, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            return "redirect:/dashboard";
        }
        userService.setActive(userId, true);
        redirectAttributes.addFlashAttribute("success", "User unblocked");
        return "redirect:/admin";
    }

    @PostMapping("/admin/users/{userId}/reset-password")
    public String adminResetPassword(@PathVariable UUID userId, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            return "redirect:/dashboard";
        }
        String tempPassword = userService.resetPassword(userId);
        redirectAttributes.addFlashAttribute("tempPassword", "Temporary password: " + tempPassword);
        return "redirect:/admin";
    }

    private boolean isAdmin(HttpSession session) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) session.getAttribute("roles");
        return roles != null && roles.contains("ADMIN");
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
