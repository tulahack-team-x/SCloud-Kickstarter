import java.sql.DriverManager;

public class DatabaseSetup {
    public static void main(String[] args) throws Exception {
        String port = System.getenv("DATABASE_PORT");
        String password = System.getenv("DATABASE_PASSWORD");
        try (var connection = DriverManager.getConnection(
                "jdbc:postgresql://127.0.0.1:" + port + "/postgres", "scloud_admin",
                System.getenv("DATABASE_ADMIN_PASSWORD"))) {
            connection.setAutoCommit(true);
            try (var query = connection.createStatement()) {
                try (var result = query.executeQuery("SELECT 1 FROM pg_roles WHERE rolname='kickstarter'")) {
                    if (!result.next()) {
                        try (var format = connection.prepareStatement("SELECT format('CREATE ROLE kickstarter LOGIN PASSWORD %L', ?::text)")) {
                            format.setString(1, password);
                            try (var sql = format.executeQuery()) {
                                sql.next();
                                try (var create = connection.createStatement()) { create.execute(sql.getString(1)); }
                            }
                        }
                    }
                }
                try (var result = query.executeQuery("SELECT 1 FROM pg_database WHERE datname='kickstarter'")) {
                    if (!result.next()) {
                        try (var create = connection.createStatement()) {
                            create.execute("CREATE DATABASE kickstarter OWNER kickstarter ENCODING 'UTF8'");
                        }
                    }
                }
            }
        }
        try (var connection = DriverManager.getConnection(
                "jdbc:postgresql://127.0.0.1:" + port + "/kickstarter", "kickstarter", password)) {
            if (!connection.isValid(5)) throw new IllegalStateException("Database check failed");
        }
        System.out.println("Database initialized");
    }
}
