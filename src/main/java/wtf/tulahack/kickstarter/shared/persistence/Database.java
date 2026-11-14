package wtf.tulahack.kickstarter.shared.persistence;

import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.Callable;

public interface Database {
    <T extends StoredEntity> void initialize(Class<T> entityType) throws SQLException;

    <T extends StoredEntity> T get(Class<T> entityType, String id);

    <T extends StoredEntity> List<T> all(Class<T> entityType);

    <T extends StoredEntity> List<T> find(Class<T> entityType, String field, Object value);

    <T extends StoredEntity> T insert(T entity);

    <T extends StoredEntity> T update(T entity);

    <T extends StoredEntity> void delete(T entity);

    <T> T write(Callable<T> action);
}
