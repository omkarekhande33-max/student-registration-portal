package com.student.util;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Step 5: Backend Database Connectivity (JDBC Utility)
 * Establishes a connection to the MySQL student_db database.
 */
public class DBConnection {

    // Database connection parameters
    private static final String URL = 
        System.getProperty("db.url", "jdbc:mysql://localhost:3306/student_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
    
    private static final String USER = 
        System.getProperty("db.user", "root");
        
    // Default password can be configured here or passed via JVM argument -Ddb.password=xxx
    private static final String PASSWORD = 
        System.getProperty("db.password", "root"); // Change to your MySQL password if different

    /**
     * Obtains a connection to the MySQL database
     * @return Connection object, or null if connection failed
     */
    public static Connection getConnection() {
        Connection con = null;
        try {
            // Load MySQL JDBC driver class
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Connect using DriverManager
            con = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (Exception e) {
            System.err.println("[DBConnection] Error connecting to MySQL database: " + e.getMessage());
            e.printStackTrace();
        }
        return con;
    }
}
