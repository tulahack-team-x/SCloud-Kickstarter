package wtf.tulahack.kickstarter.composition.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {
    @GetMapping({"/", "/login", "/register", "/cabinet", "/organizations", "/organizations/{id}",
            "/projects/new", "/projects/{id}", "/projects/{id}/edit"})
    public String index() {
        return "forward:/index.html";
    }
}
