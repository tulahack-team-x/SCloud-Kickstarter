package wtf.tulahack.kickstarter.composition.web.controller;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import wtf.tulahack.kickstarter.composition.application.RegistrationService;
import wtf.tulahack.kickstarter.identify.api.AccountView;

import java.net.URI;
import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationService registration;

    @PostMapping("/api/auth/register")
    public Callable<ResponseEntity<AccountView>> register(
            @Valid @RequestBody RegistrationService.Register command) {
        return () ->
                ResponseEntity.created(URI.create("/api/me")).body(registration.register(command));
    }
}
