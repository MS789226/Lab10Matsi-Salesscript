import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.util.*;

public class Main {

    private static final String URL =
           
    private static final String USER = "root";
    private static final String PASSWORD =";root"
    private static final String STUDENT_NUMBER = "n070983456"
    private static final String TABLE =
            STUDENT_NUMBER + "_Orders";

    public static void main(String[] args) {
        new Main().run();
    }

    private void run() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            try (Connection connection =
                         DriverManager.getConnection(URL, USER, PASSWORD)) {

                createTable(connection);
                runScript(connection);
                printBills(connection);
            }

        } catch (ClassNotFoundException e) {
            System.out.println("MySQL driver not found.");
        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("SQL file error: " + e.getMessage());
        }
    }

    private void createTable(Connection connection) throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS %s (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    customer VARCHAR(100),
                    amount INT
                )
                """.formatted(TABLE);

        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate(sql);
        }
    }

    private void runScript(Connection connection)
            throws IOException, SQLException {

        String file = Files.readString(
                Path.of("src/main/resources/salesScripts.sql")
        );

        try (Statement statement = connection.createStatement()) {
            for (String query : file.split(";")) {
                query = query.trim();

                if (!query.isEmpty()) {
                    query = query.replace("Orders", TABLE);
                    statement.executeUpdate(query);
                }
            }
        }
    }

    private void printBills(Connection connection) throws SQLException {
        Map<String, Integer> bills = new LinkedHashMap<>();

        String sql = "SELECT customer, amount FROM " + TABLE;

        try (
                PreparedStatement statement =
                        connection.prepareStatement(sql);
                ResultSet results = statement.executeQuery()
        ) {
            while (results.next()) {
                String customer = results.getString("customer");
                int amount = results.getInt("amount");

                bills.put(
                        customer,
                        bills.getOrDefault(customer, 0) + amount
                );
            }
        }

        System.out.println("CPAN 211 Lab 10 - Final Customer Bills");

        for (Map.Entry<String, Integer> bill : bills.entrySet()) {
            System.out.println(
                    bill.getKey() + ": $" + bill.getValue()
            );
        }
    }
}