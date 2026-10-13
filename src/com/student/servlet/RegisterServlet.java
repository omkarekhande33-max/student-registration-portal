package com.student.servlet;

import com.student.util.DBConnection;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Step 6.1: Backend Servlet - RegisterServlet
 * Mapped to /RegisterServlet.
 * Extracts user registration input and inserts into students table using PreparedStatement.
 */
@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Redirect GET requests to the registration page
        response.sendRedirect("register.html");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        // 1. Extract user inputs using request.getParameter()
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        // Server-side validation check
        if (name == null || email == null || password == null ||
            name.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty()) {
            response.sendRedirect("register.html?error=empty");
            return;
        }

        name = name.trim();
        email = email.trim().toLowerCase();

        // 2. Use JDBC (PreparedStatement) to insert the data into the students table
        Connection con = null;
        PreparedStatement ps = null;

        try {
            con = DBConnection.getConnection();
            if (con == null) {
                System.err.println("[RegisterServlet] Database connection is null!");
                response.sendRedirect("register.html?error=dbConnection");
                return;
            }

            String sql = "INSERT INTO students (name, email, password) VALUES (?, ?, ?)";
            ps = con.prepareStatement(sql);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, password);

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                // 3. Redirect the user to login.html upon successful registration
                response.sendRedirect("login.html?registered=true");
            } else {
                response.sendRedirect("register.html?error=failed");
            }

        } catch (SQLIntegrityConstraintViolationException e) {
            // Duplicate email entry
            System.err.println("[RegisterServlet] Duplicate email: " + email);
            response.sendRedirect("register.html?error=exists");
        } catch (SQLException e) {
            e.printStackTrace();
            // In case of MySQL duplicate key error code 1062
            if (e.getErrorCode() == 1062) {
                response.sendRedirect("register.html?error=exists");
            } else {
                response.sendRedirect("register.html?error=database");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("register.html?error=unknown");
        } finally {
            // Clean up resources
            if (ps != null) {
                try { ps.close(); } catch (SQLException ignored) {}
            }
            if (con != null) {
                try { con.close(); } catch (SQLException ignored) {}
            }
        }
    }
}
