#### A code in Java to query a MySQL DB

```java
package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

// Press Shift twice to open the Search Everywhere dialog and type `show whitespaces`,
// then press Enter. You can now see whitespace characters in your code.
public class Main {

    // JDBC URL, username, and password of MySQL server

    private static final String USERNAME = "[USER]";
    private static final String PASSWORD = "[PASSWORD]";

    public static void main(String[] args) {

        String JDBC_URL = "jdbc:mysql://localhost:3306";
        String DBNAME = "[DBNAME]";

        // Establishing connection
        try (Connection connection = DriverManager.getConnection(JDBC_URL + "/" + DBNAME, USERNAME, PASSWORD)) {
            System.out.println("Connected to the database!");

            // Creating statement
            try (Statement statement = connection.createStatement()) {
                // Executing query
                String sqlQuery = "[SQL STATEMENT];";
                try (ResultSet resultSet = statement.executeQuery(sqlQuery)) {
                    // Processing results
                    while (resultSet.next()) {
                        // Example: Assuming the table has a column named "name"
                        String pid = resultSet.getString("pid");
                        System.out.printf("%s\n",pid);
                    }
                }
            } catch (SQLException e) {
                System.err.println("Error executing query: " + e.getMessage());
            }
        } catch (SQLException e) {
            System.err.println("Connection failed: " + e.getMessage());
        }

    }
}
```

#### A code in Java to do a GET request

``` java
package org.example;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
// import java.nio.file.Path;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import java.io.FileReader;
import java.util.Iterator;
import java.util.Map;
import java.util.ArrayList;

// Press Shift twice to open the Search Everywhere dialog and type `show whitespaces`,
// then press Enter. You can now see whitespace characters in your code.
public class Main {

    public static void main(String[] args) {
        // Press Alt+Enter with your caret at the highlighted text to see how
        // IntelliJ IDEA suggests fixing it.
        // ParseJson();
        GetRequest();
    }

    public static void GetRequest()
    {
        try {
            // URL of the API endpoint
            String apiUrl = "[URL]";

            // Create a URL object with the API endpoint
            URL url = new URL(apiUrl);

            // Open a connection to the URL
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Set request method to GET
            connection.setRequestMethod("GET");

            // Set timeout for connection and read
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            // Get the response code
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // Read the response from the API
            BufferedReader reader;
            if (responseCode == HttpURLConnection.HTTP_OK) {
                reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            } else {
                reader = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
            }

            // Read the response line by line and print it
            String line;
            StringBuilder response = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            // Print the response
            System.out.println("Response: " + response.toString());

            // Disconnect the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void DirectoryWalker() {

        String directoryPath = "[DIRPATH]";
        try {
            Files.walk(Paths.get(directoryPath))
                    .filter(Files::isRegularFile) // Filter out only regular files
                    .forEach(System.out::println); // Print each file path
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void ParseJson(){

        JSONParser parser = new JSONParser();

        try (FileReader reader = new FileReader("[JSON_FILE]")) {
            // Parse JSON file
            Object obj = parser.parse(reader);

            // Convert parsed JSON object to JSONObject
            JSONObject jsonObject = (JSONObject) obj;
            JSONArray list = (JSONArray) jsonObject.get("[FIELD]");
            Iterator<Object> it = list.iterator();

            while(it.hasNext())
            {
                Map pair = (Map) it.next();
                System.out.println(pair.get("[FIELD_NAME]"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```