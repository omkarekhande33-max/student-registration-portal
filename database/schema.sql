-- ==============================================================================
-- Student Registration Portal - Database Setup Script
-- Compatible with MySQL 5.7+ and MySQL 8.0+
-- Matches exact specification from PDF Step 2
-- ==============================================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- 2. Create the students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. (Optional) Sample seed data for testing
INSERT INTO students (name, email, password) 
VALUES 
    ('John Doe', 'john.doe@example.com', 'password123'),
    ('Jane Smith', 'jane.smith@example.com', 'securePass@2026')
ON DUPLICATE KEY UPDATE name=name;

-- 4. Verify table creation
SELECT * FROM students;
