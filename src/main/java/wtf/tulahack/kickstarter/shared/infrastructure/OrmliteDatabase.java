package wtf.tulahack.kickstarter.shared.infrastructure;

import com.j256.ormlite.dao.Dao;
import com.j256.ormlite.dao.DaoManager;
import com.j256.ormlite.jdbc.JdbcPooledConnectionSource;
import com.j256.ormlite.misc.TransactionManager;
import com.j256.ormlite.table.TableUtils;

import jakarta.annotation.PreDestroy;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class OrmliteDatabase implements Database {
    private final JdbcPooledConnectionSource connections;
    private final ReadCache readCache;
    private final ThreadLocal<Boolean> writing = ThreadLocal.withInitial(() -> false);
    private final Map<Class<?>, Dao<?, String>> tables = new ConcurrentHashMap<>();

    public OrmliteDatabase(
            @Value("${app.database.url}") String url,
            @Value("${app.database.username}") String username,
            @Value("${app.database.password}") String password,
            ReadCache readCache)
            throws SQLException {
        connections = new JdbcPooledConnectionSource(url, username, password);
        this.readCache = readCache;
        connections.setMaxConnectionsFree(8);
    }

    public synchronized <T extends StoredEntity> void initialize(Class<T> entityType)
            throws SQLException {
        TableUtils.createTableIfNotExists(connections, entityType);
        Dao<T, String> table = DaoManager.createDao(connections, entityType);
        tables.put(entityType, table);
    }

    @SuppressWarnings("unchecked")
    private <T extends StoredEntity> Dao<T, String> table(Class<T> entityType) {
        Dao<T, String> table = (Dao<T, String>) tables.get(entityType);
        if (table == null) {
            throw new IllegalStateException("Unregistered table: " + entityType.getName());
        }
        return table;
    }

    public <T extends StoredEntity> T get(Class<T> entityType, String id) {
        T entity = sql(() -> table(entityType).queryForId(id));
        if (entity == null) {
            throw ApplicationException.notFound();
        }
        return entity;
    }

    public <T extends StoredEntity> List<T> all(Class<T> entityType) {
        return sql(() -> table(entityType).queryBuilder().orderBy("createdAt", false).query());
    }

    public <T extends StoredEntity> List<T> find(Class<T> entityType, String field, Object value) {
        return sql(() -> table(entityType).queryForEq(field, value));
    }

    @SuppressWarnings("unchecked")
    public <T extends StoredEntity> T insert(T entity) {
        sql(() -> table((Class<T>) entity.getClass()).create(entity));
        return entity;
    }

    @SuppressWarnings("unchecked")
    public <T extends StoredEntity> T update(T entity) {
        int changed = sql(() -> table((Class<T>) entity.getClass()).update(entity));
        if (changed != 1) {
            throw ApplicationException.conflict("Запись изменена другим запросом");
        }
        return entity;
    }

    @SuppressWarnings("unchecked")
    public <T extends StoredEntity> void delete(T entity) {
        sql(() -> table((Class<T>) entity.getClass()).delete(entity));
    }

    public synchronized <T> T write(Callable<T> action) {
        if (writing.get()) {
            return sql(action);
        }
        writing.set(true);
        try {
            T result = sql(() -> TransactionManager.callInTransaction(connections, action));
            readCache.committed();
            log.debug("Database command committed");
            return result;
        } finally {
            writing.remove();
        }
    }

    private <T> T sql(Callable<T> action) {
        try {
            return action.call();
        } catch (ApplicationException exception) {
            throw exception;
        } catch (Exception exception) {
            Throwable cause = exception;
            while (cause.getCause() != null && cause != cause.getCause()) {
                cause = cause.getCause();
            }
            if (cause instanceof ApplicationException applicationException) {
                throw applicationException;
            }
            if (cause instanceof SQLException sqlException
                    && "23505".equals(sqlException.getSQLState())) {
                throw ApplicationException.conflict("Такая запись уже существует");
            }
            throw new IllegalStateException("Database operation failed", exception);
        }
    }

    @PreDestroy
    public void close() throws Exception {
        connections.close();
    }
}
