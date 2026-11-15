package wtf.tulahack.kickstarter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WebApplicationTest {
    @LocalServerPort
    private int port;

    private HttpResponse<String> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void servesFrontendAndDeepLinksWithoutAuthentication() throws Exception {
        for (String path : new String[] {"/", "/register", "/projects/new", "/cabinet"}) {
            var response = get(path);
            assertEquals(200, response.statusCode(), path);
            assertTrue(response.body().contains("<div id=\"root\"></div>"), path);
        }
    }

    @Test
    void keepsPrivateApiProtected() throws Exception {
        assertEquals(401, get("/api/me").statusCode());
        assertEquals(401, get("/api/orders").statusCode());
    }

    @Test
    void servesPublicHealthAsJson() throws Exception {
        var response = get("/api/health");
        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"status\":\"UP\""));
    }
}
