package wtf.tulahack.kickstarter.shared.error;

import lombok.Getter;

import org.springframework.http.HttpStatus;

@Getter
public class ApplicationException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApplicationException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApplicationException notFound() {
        return new ApplicationException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Объект не найден");
    }

    public static ApplicationException forbidden() {
        return new ApplicationException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Недостаточно прав");
    }

    public static ApplicationException conflict(String message) {
        return new ApplicationException(HttpStatus.CONFLICT, "CONFLICT", message);
    }

    public static ApplicationException invalid(String message) {
        return new ApplicationException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }
}
