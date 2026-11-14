package wtf.tulahack.kickstarter.shared.persistence;

import com.j256.ormlite.field.DatabaseField;

import lombok.Getter;

import wtf.tulahack.kickstarter.shared.error.ApplicationException;

import java.time.Instant;
import java.util.UUID;

@Getter
public abstract class StoredEntity {
    @DatabaseField(id = true, width = 36)
    protected String id = UUID.randomUUID().toString();

    @DatabaseField(canBeNull = false, width = 40)
    protected String createdAt = Instant.now().toString();

    @DatabaseField(canBeNull = false, version = true)
    protected long version;

    public void requireVersion(long expectedVersion) {
        if (version != expectedVersion) {
            throw ApplicationException.conflict("Данные изменились. Обновите страницу");
        }
    }
}
