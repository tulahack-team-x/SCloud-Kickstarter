package wtf.tulahack.kickstarter.files.internal.application;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

public interface BinaryObjectStorage {
    void store(String key, InputStream contents) throws IOException;

    Resource read(String key);

    void delete(String key) throws IOException;
}
