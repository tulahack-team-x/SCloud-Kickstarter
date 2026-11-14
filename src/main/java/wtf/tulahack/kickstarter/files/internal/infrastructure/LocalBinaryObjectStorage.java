package wtf.tulahack.kickstarter.files.internal.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import wtf.tulahack.kickstarter.files.internal.application.BinaryObjectStorage;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Component
public class LocalBinaryObjectStorage implements BinaryObjectStorage {
    private final Path directory;

    public LocalBinaryObjectStorage(@Value("${app.files.directory}") String directory)
            throws IOException {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        Files.createDirectories(this.directory);
    }

    @Override
    public void store(String key, InputStream contents) throws IOException {
        Path target = resolve(key);
        Path temporary = Files.createTempFile(directory, "upload-", ".tmp");
        try {
            Files.copy(contents, temporary, StandardCopyOption.REPLACE_EXISTING);
            Files.move(temporary, target, StandardCopyOption.ATOMIC_MOVE);
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    @Override
    public Resource read(String key) {
        Resource resource = new FileSystemResource(resolve(key));
        if (!resource.exists()) {
            throw ApplicationException.notFound();
        }
        return resource;
    }

    @Override
    public void delete(String key) throws IOException {
        Files.deleteIfExists(resolve(key));
    }

    private Path resolve(String key) {
        if (!key.matches("[0-9a-f-]{36}")) {
            throw ApplicationException.invalid("Некорректный ключ файла");
        }
        return directory.resolve(key);
    }
}
