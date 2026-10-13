# Student Registration Portal (Web Technology Mini Project)

A complete, production-grade **Dynamic Web Project** developed according to the specifications in the project guide.

---

## 🌟 Features & Compliance with Project Guide

| Step | Requirement in PDF | Implementation File | Status |
| :--- | :--- | :--- | :--- |
| **Step 1** | Project Setup & JDBC Driver Dependency | `pom.xml`, `.project`, `.classpath`, `WebContent/WEB-INF/lib/mysql-connector-j-8.3.0.jar` | ✅ Complete |
| **Step 2** | MySQL Database & `students` table | `database/schema.sql` (`student_db` database, `students` table) | ✅ Complete |
| **Step 3** | Frontend Development (HTML5 & Bootstrap 5) | `WebContent/register.html`, `WebContent/login.html`, `WebContent/css/style.css` | ✅ Complete |
| **Step 4** | Client-Side Validation (DOM Manipulation & Regex) | `WebContent/js/script.js` (`document.getElementById`, Regex, DOM error nodes) | ✅ Complete |
| **Step 5** | Backend Database Connectivity (JDBC Utility) | `src/com/student/util/DBConnection.java` (`com.mysql.cj.jdbc.Driver`) | ✅ Complete |
| **Step 6** | Backend Servlets (`RegisterServlet`, `LoginServlet`) | `src/com/student/servlet/RegisterServlet.java`, `src/com/student/servlet/LoginServlet.java` | ✅ Complete |
| **Step 7** | Protected Dashboard & Session Management | `WebContent/dashboard.jsp`, `src/com/student/servlet/LogoutServlet.java` | ✅ Complete |

---

## 📁 Project Architecture & Directory Structure

```text
WT miniproject/
├── database/
│   └── schema.sql                          # MySQL Database & Table creation script
├── WebContent/                             # Standard Eclipse Dynamic Web Project root
│   ├── css/
│   │   └── style.css                       # Modern glassmorphism design system & micro-interactions
│   ├── js/
│   │   └── script.js                       # DOM validation, Regex, and password meter
│   ├── WEB-INF/
│   │   ├── lib/
│   │   │   ├── mysql-connector-j-8.3.0.jar # MySQL JDBC Driver
│   │   │   └── javax.servlet-api-4.0.1.jar # Servlet API dependency
│   │   └── web.xml                         # Deployment descriptor (servlets & session config)
│   ├── register.html                       # Step 3: Registration page
│   ├── login.html                          # Step 3: Login page
│   └── dashboard.jsp                       # Step 7: Protected student dashboard
├── src/
│   └── com/
│       └── student/
│           ├── util/
│           │   └── DBConnection.java       # Step 5: MySQL JDBC Connection utility
│           └── servlet/
│               ├── RegisterServlet.java    # Step 6.1: Registration servlet (@WebServlet("/RegisterServlet"))
│               ├── LoginServlet.java       # Step 6.2: Login servlet (@WebServlet("/LoginServlet"))
│               └── LogoutServlet.java      # Step 7.3: Logout servlet (@WebServlet("/LogoutServlet"))
├── run_preview.py                          # Built-in live preview server (http://localhost:8080)
├── pom.xml                                 # Maven project descriptor
├── .project                                # Eclipse project metadata
├── .classpath                              # Eclipse build path metadata
└── README.md                               # Project documentation
```

---

## 🚀 Option 1: Instant Live Demo (No Eclipse/Tomcat Setup Required)

The project includes an embedded preview server so you can immediately test and demonstrate the portal in any browser:

1. Open a terminal in this project directory:
   ```bash
   python run_preview.py
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:8080/register.html
   ```
3. Test all flows:
   - Client-side validation: try submitting empty forms or invalid emails.
   - Register a student account -> redirects to `login.html?registered=true`.
   - Sign in -> redirects to protected `dashboard.jsp` displaying user data.
   - Try navigating to `http://localhost:8080/dashboard.jsp` in an incognito window -> automatically blocked and redirected to `login.html?error=sessionExpired`.
   - Click **Logout** -> invalidates session and redirects to `login.html?loggedOut=true`.

---

## 🛠️ Option 2: Running in Eclipse Enterprise Edition

1. **Import Project**:
   - Open Eclipse IDE for Enterprise Java and Web Developers.
   - Click **File > Open Projects from File System...** (or **Import > Existing Projects into Workspace**).
   - Select the directory: `D:\Projects\WT miniproject`.
   - Click **Finish**. (Eclipse will immediately recognize it as a Dynamic Web Project thanks to pre-configured `.project` and `.classpath` files).

2. **Setup Database**:
   - Open MySQL Workbench or MySQL Command Line Client.
   - Run the script located in `database/schema.sql`:
     ```sql
     SOURCE D:/Projects/WT miniproject/database/schema.sql;
     ```
   - Update your MySQL username/password in [DBConnection.java](file:///d:/Projects/WT%20miniproject/src/com/student/util/DBConnection.java#L16-L23) if different from `root`/`root`.

3. **Deploy to Apache Tomcat**:
   - In the Eclipse **Servers** tab, click **New > Server > Apache > Tomcat v9.0** (or Tomcat v10+).
   - Add **StudentPortal** to the server.
   - Click **Start Server** and right-click `register.html` > **Run As > Run on Server**.

---

## 💻 Option 3: Running in IntelliJ IDEA Ultimate

1. Open IntelliJ IDEA -> **Open** -> Select `D:\Projects\WT miniproject`.
2. IntelliJ will detect both the Maven `pom.xml` and Web facet.
3. Add a Tomcat Run Configuration (**Run > Edit Configurations > Add New > Tomcat Server > Local**).
4. Under the **Deployment** tab, add `StudentPortal:war exploded`.
5. Run the configuration.

---

## 🧪 Validated Test Results

- **Client-Side Form Validation**: Fully validated using DOM manipulation (`document.getElementById`), email regex testing, and live password strength indicator.
- **Database Insertion**: Verified parameterized SQL via `PreparedStatement` in `RegisterServlet`.
- **Session Protection**: Verified session access control on `dashboard.jsp` (`session.getAttribute("userEmail") == null` redirect).
- **Session Invalidation**: Verified `session.invalidate()` in `LogoutServlet`.
