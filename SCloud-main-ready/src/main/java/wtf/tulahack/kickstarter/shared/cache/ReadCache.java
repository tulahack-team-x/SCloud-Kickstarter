package wtf.tulahack.kickstarter.shared.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

@Slf4j
@Component
public class ReadCache {
    private final Cache<Key, Snapshot> snapshots;
    private final AtomicLong generation = new AtomicLong();
    private final ObjectMapper json;

    public ReadCache(
            ObjectMapper json,
            @Value("${app.cache.maximum-weight-bytes}") long maximumWeight,
            @Value("${app.cache.ttl-seconds}") long ttlSeconds) {
        if (maximumWeight < 1024 || ttlSeconds < 1) {
            throw new IllegalArgumentException(
                    "Cache weight must be at least 1024 bytes; TTL must be positive");
        }
        this.json = json;
        snapshots =
                Caffeine.newBuilder()
                        .maximumWeight(maximumWeight)
                        .weigher((Key key, Snapshot snapshot) -> snapshot.weight())
                        .expireAfterWrite(Duration.ofSeconds(ttlSeconds))
                        .build();
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String namespace, Supplier<T> loader, Object... parameters) {
        Key key =
                new Key(
                        generation.get(),
                        namespace,
                        Collections.unmodifiableList(Arrays.asList(parameters.clone())));
        Snapshot existing = snapshots.getIfPresent(key);
        if (existing != null) {
            log.debug("Read cache hit: {}", namespace);
            return (T) existing.value();
        }
        return (T)
                snapshots
                        .get(
                                key,
                                ignored -> {
                                    T value = loader.get();
                                    long estimatedWeight =
                                            (long) json.writeValueAsBytes(value).length * 2 + 256;
                                    long keyWeight = namespace.length() * 2L;
                                    for (Object parameter : parameters) {
                                        keyWeight +=
                                                parameter instanceof String text
                                                        ? text.length() * 2L
                                                        : 32;
                                    }
                                    int weight =
                                            (int)
                                                    Math.min(
                                                            Integer.MAX_VALUE,
                                                            estimatedWeight + keyWeight);
                                    log.debug("Read cache load: {}", namespace);
                                    return new Snapshot(value, weight);
                                })
                        .value();
    }

    public void committed() {
        generation.incrementAndGet();
        snapshots.invalidateAll();
    }

    private record Key(long generation, String namespace, List<Object> parameters) {}

    private record Snapshot(Object value, int weight) {}
}
