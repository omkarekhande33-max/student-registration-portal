package com.student.servlet;

import com.student.util.DBConnection;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Step 6.2: Backend Servlet - LoginServlet
 * Mapped to /LoginServlet.
 * Verifies credentials, manages HTTP session, and redirects to dashboard.jsp.
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Redirect GET requests to login page
        response.sendRedirect("login.html");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        // Input validation
        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            response.sendRedirect("login.html?error=invalid");
            return;
        }

        email = email.trim().toLowerCase();

        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            con = DBConnection.getConnection();
            if (con == null) {
                System.err.println("[LoginServlet] Database connection is null!");
                response.sendRedirect("login.html?error=dbConnection");
                return;
            }

            // Verify credentials against database records
            String sql = "SELECT id, name, email, created_at FROM students WHERE email = ? AND password = ?";
            ps = con.prepareStatement(sql);
            ps.setString(1, email);
            ps.setString(2, password);

            rs = ps.executeQuery();

            if (rs.next()) {
                // Credentials match -> Session-Based Login
                int id = rs.getInt("id");
                String name = rs.getString("name");
                String createdAt = rs.getString("created_at");

                // Step 6.2 requirement:
                // HttpSession session = request.getSession();
                // session.setAttribute("userEmail", email);
                // response.sendRedirect("dashboard.jsp");
                HttpSession session = request.getSession();
                session.setAttribute("userEmail", email);
                session.setAttribute("userName", name);
                session.setAttribute("userId", id);
                session.setAttribute("createdAt", createdAt);

                response.sendRedirect("dashboard.jsp");
            } else {
                // Authentication failed -> redirect back to login with error message
                response.sendRedirect("login.html?error=invalid");
            }

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendRedirect("login.html?error=database");
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("login.html?error=unknown");
        } finally {
            if (rs != null) {
                try { rs.close(); } catch (SQLException ignored) {}
            }
            if (ps != null) {
                try { ps.close(); } catch (SQLException ignored) {}
            }
            if (con != null) {
                try { con.close(); } catch (SQLException ignored) {}
            }
        }
    }
}
