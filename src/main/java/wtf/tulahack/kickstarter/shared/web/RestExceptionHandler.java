package wtf.tulahack.kickstarter.shared.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import wtf.tulahack.kickstarter.shared.error.ApplicationException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class RestExceptionHandler {
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiError> application(
            ApplicationException exception, HttpServletRequest request) {
        return response(
                exception.getStatus(),
                exception.getCode(),
                exception.getMessage(),
                Map.of(),
                request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(
            MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception
                .getBindingResult()
                .getFieldErrors()
                .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(
                HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Проверьте поля", fields, request);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiError> malformed(Exception exception, HttpServletRequest request) {
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "Некорректный запрос",
                Map.of(),
                request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> upload(
            MaxUploadSizeExceededException exception, HttpServletRequest request) {
        return response(
                HttpStatus.valueOf(413), "FILE_TOO_LARGE", "Файл больше 10 МБ", Map.of(), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(
            ResponseStatusException exception, HttpServletRequest request) {
        return response(
                HttpStatus.valueOf(exception.getStatusCode().value()),
                "REQUEST_FAILED",
                "Запрос отклонён",
                Map.of(),
                request);
    }

    @ExceptionHandler({
        org.springframework.web.servlet.resource.NoResourceFoundException.class,
        org.springframework.web.bind.MissingServletRequestParameterException.class,
        org.springframework.web.bind.MissingRequestHeaderException.class,
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
        org.springframework.web.HttpRequestMethodNotSupportedException.class,
        org.springframework.web.HttpMediaTypeNotSupportedException.class,
        org.springframework.web.HttpMediaTypeNotAcceptableException.class,
        org.springframework.web.method.annotation.HandlerMethodValidationException.class
    })
    public ResponseEntity<ApiError> requestError(Exception exception, HttpServletRequest request) {
        HttpStatus status =
                exception instanceof org.springframework.web.ErrorResponse error
                        ? HttpStatus.valueOf(error.getStatusCode().value())
                        : HttpStatus.BAD_REQUEST;
        return response(
                status,
                "INVALID_REQUEST",
                "Проверьте адрес, метод и параметры запроса",
                Map.of(),
                request);
    }

    @ExceptionHandler({
        org.springframework.core.task.TaskRejectedException.class,
        java.util.concurrent.RejectedExecutionException.class
    })
    public ResponseEntity<ApiError> overloaded(Exception exception, HttpServletRequest request) {
        return response(
                HttpStatus.SERVICE_UNAVAILABLE,
                "SERVER_BUSY",
                "Сервер занят. Повторите запрос позже",
                Map.of(),
                request);
    }

    @ExceptionHandler(
            org.springframework.web.context.request.async.AsyncRequestTimeoutException.class)
    public ResponseEntity<ApiError> timeout(Exception exception, HttpServletRequest request) {
        return response(
                HttpStatus.SERVICE_UNAVAILABLE,
                "REQUEST_TIMEOUT",
                "Запрос занял слишком много времени. Проверьте состояние ресурса",
                Map.of(),
                request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Request {} failed", request.getAttribute("requestId"), exception);
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "Ошибка сервера",
                Map.of(),
                request);
    }

    private ResponseEntity<ApiError> response(
            HttpStatus status,
            String code,
            String message,
            Map<String, String> fields,
            HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(
                        new ApiError(
                                code, message, fields, (String) request.getAttribute("requestId")));
    }
}
