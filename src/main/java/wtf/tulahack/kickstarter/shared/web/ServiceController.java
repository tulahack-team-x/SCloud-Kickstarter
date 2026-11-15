package wtf.tulahack.kickstarter.shared.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ServiceController {
    @GetMapping("/api/health")
    public Map<String, String> info() {
        return Map.of(
                "service",
                "SCloud Kickstarter",
                "status",
                "UP",
                "projects",
                "/api/projects",
                "csrf",
                "/api/auth/csrf");
    }
}
