<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, com.student.util.DBConnection" %>
<%
    // ==============================================================================
    // Step 7.2: Protected Dashboard - Session Access Control
    // Prevents unauthorized direct URL access if session does not exist.
    // ==============================================================================
    if (session.getAttribute("userEmail") == null) {
        response.sendRedirect("login.html?error=sessionExpired");
        return;
    }

    String userEmail = (String) session.getAttribute("userEmail");
    String userName = (String) session.getAttribute("userName");
    Integer userId = (Integer) session.getAttribute("userId");
    String createdAt = (String) session.getAttribute("createdAt");

    // Fallback: If name/details not yet in session, retrieve from DB using userEmail
    if (userName == null || userName.trim().isEmpty()) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            if (conn != null) {
                ps = conn.prepareStatement("SELECT id, name, created_at FROM students WHERE email = ?");
                ps.setString(1, userEmail);
                rs = ps.executeQuery();
                if (rs.next()) {
                    userId = rs.getInt("id");
                    userName = rs.getString("name");
                    createdAt = rs.getString("created_at");
                    session.setAttribute("userName", userName);
                    session.setAttribute("userId", userId);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception ignored) {}
            if (ps != null) try { ps.close(); } catch (Exception ignored) {}
            if (conn != null) try { conn.close(); } catch (Exception ignored) {}
        }
    }

    if (userName == null || userName.isEmpty()) {
        userName = "Student Member";
    }

    // Generate initials for avatar
    String initials = "ST";
    if (userName != null && userName.length() > 0) {
        String[] parts = userName.trim().split("\\s+");
        if (parts.length >= 2) {
            initials = ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        } else if (parts.length == 1) {
            initials = ("" + parts[0].charAt(0)).toUpperCase();
        }
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard | <%= userName %></title>

  <!-- Bootstrap 5 CSS CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Bootstrap Icons CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

  <!-- Custom Design System CSS -->
  <link href="css/style.css" rel="stylesheet">
</head>
<body>

  <!-- Ambient Light Background -->
  <div class="bg-ambient-wrapper">
    <div class="ambient-orb-1"></div>
    <div class="ambient-orb-2"></div>
  </div>

  <div class="dashboard-wrapper">
    
    <!-- Top Navigation Bar -->
    <header class="dashboard-navbar">
      <a href="dashboard.jsp" class="dashboard-brand">
        <div class="brand-badge mb-0" style="width: 40px; height: 40px; font-size: 1.2rem; border-radius: 10px;">
          <i class="bi bi-mortarboard-fill"></i>
        </div>
        <span>StudentPortal</span>
      </a>

      <div class="dashboard-user-menu">
        <div class="d-none d-md-flex flex-column text-end">
          <span class="fw-semibold text-dark"><%= userName %></span>
          <span class="text-muted small"><%= userEmail %></span>
        </div>
        <div class="user-avatar-initials" title="<%= userName %>">
          <%= initials %>
        </div>
        <!-- Step 7.3: Logout mechanism linking to LogoutServlet -->
        <a href="LogoutServlet" class="btn-logout" id="logoutBtn" title="Logout from account">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </a>
      </div>
    </header>

    <!-- Welcome Hero Section -->
    <div class="welcome-hero">
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
          <i class="bi bi-check-circle-fill me-1"></i> Verified Student Session
        </span>
      </div>
      <h1 class="hero-greeting">Welcome back, <%= userName %>!</h1>
      <p class="hero-subtitle">
        Your student portal gives you unified access to your registered profile, university courses, and academic records.
      </p>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-light btn-sm fw-semibold px-3 py-2" onclick="alert('Profile is in good standing!')">
          <i class="bi bi-person-badge me-1"></i> View ID Card
        </button>
        <a href="#profileSection" class="btn btn-outline-light btn-sm fw-semibold px-3 py-2">
          <i class="bi bi-shield-check me-1"></i> Account Details
        </a>
      </div>
    </div>

    <!-- Student Info Grid -->
    <div class="row g-4" id="profileSection">
      
      <!-- Student Profile Card (Step 7.1: User-Specific Data) -->
      <div class="col-lg-5 col-md-12">
        <div class="info-card">
          <div class="info-card-header">
            <div class="card-icon-wrapper icon-purple">
              <i class="bi bi-person-lines-fill"></i>
            </div>
            <div>
              <h5 class="mb-0 fw-bold">Student Profile</h5>
              <small class="text-muted">Account Information</small>
            </div>
          </div>

          <div class="profile-details-list">
            <div class="profile-field">
              <span class="field-label">Student ID</span>
              <span class="field-value">#STU-<%= (userId != null ? String.format("%04d", userId) : "001") %></span>
            </div>
            <div class="profile-field">
              <span class="field-label">Full Name</span>
              <span class="field-value"><%= userName %></span>
            </div>
            <div class="profile-field">
              <span class="field-label">Email Address</span>
              <span class="field-value"><%= userEmail %></span>
            </div>
            <div class="profile-field">
              <span class="field-label">Registration Date</span>
              <span class="field-value"><%= (createdAt != null ? createdAt : "Active Session") %></span>
            </div>
            <div class="profile-field">
              <span class="field-label">Account Status</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Session ID</span>
              <span class="text-muted font-monospace small"><%= session.getId().substring(0, Math.min(12, session.getId().length())) %>...</span>
            </div>
          </div>

          <div class="mt-4 pt-2">
            <a href="LogoutServlet" class="btn btn-outline-danger w-100 btn-sm py-2">
              <i class="bi bi-box-arrow-right me-1"></i> Invalidate Session & Logout
            </a>
          </div>
        </div>
      </div>

      <!-- Academic Overview Cards -->
      <div class="col-lg-7 col-md-12">
        <div class="row g-4">
          
          <div class="col-sm-6">
            <div class="info-card">
              <div class="info-card-header">
                <div class="card-icon-wrapper icon-blue">
                  <i class="bi bi-journal-code"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">Web Technology</h6>
                  <small class="text-muted">Current Course</small>
                </div>
              </div>
              <p class="text-muted small mb-3">Servlets, JSP, JDBC, MySQL Architecture, and Modern Web UI.</p>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: 100%"></div>
              </div>
              <div class="d-flex justify-content-between mt-2 small text-muted">
                <span>Course Progress</span>
                <span class="fw-bold text-dark">100%</span>
              </div>
            </div>
          </div>

          <div class="col-sm-6">
            <div class="info-card">
              <div class="info-card-header">
                <div class="card-icon-wrapper icon-green">
                  <i class="bi bi-database-check"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">Database Status</h6>
                  <small class="text-muted">MySQL student_db</small>
                </div>
              </div>
              <p class="text-muted small mb-3">Live connection to MySQL database via JDBC Driver.</p>
              <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                <i class="bi bi-hdd-network me-1"></i> JDBC Connected
              </span>
            </div>
          </div>

          <!-- Quick Access Cards -->
          <div class="col-12">
            <div class="info-card">
              <h5 class="fw-bold mb-3">Quick Actions</h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="p-3 border rounded-3 bg-light text-center h-100">
                    <i class="bi bi-card-checklist fs-3 text-primary mb-2 d-block"></i>
                    <h6 class="fw-semibold mb-1">Attendance</h6>
                    <small class="text-muted">94.5% Present</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3 border rounded-3 bg-light text-center h-100">
                    <i class="bi bi-calendar-event fs-3 text-info mb-2 d-block"></i>
                    <h6 class="fw-semibold mb-1">Schedule</h6>
                    <small class="text-muted">Lab Exam: Upcoming</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3 border rounded-3 bg-light text-center h-100">
                    <i class="bi bi-file-earmark-lock fs-3 text-success mb-2 d-block"></i>
                    <h6 class="fw-semibold mb-1">Security</h6>
                    <small class="text-muted">Session Protected</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Portal Footer -->
    <footer class="portal-footer">
      <p class="mb-0">Student Registration Portal &bull; Web Technology Project &bull; Tomcat & MySQL</p>
    </footer>

  </div>

  <!-- Bootstrap 5 Bundle JS CDN -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
