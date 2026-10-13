#!/usr/bin/env python3
"""
Student Registration Portal - Local Preview & Live Demo Server
Simulates Apache Tomcat container and MySQL behavior on http://localhost:8080.
Allows instant testing of the portal without needing Eclipse/Tomcat installed.
"""

import http.server
import http.cookies
import socketserver
import urllib.parse
import os
import sqlite3
import datetime
import uuid
import re

PORT = 8080
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "WebContent")
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database", "preview_student.db")

# Initialize preview SQLite database with same schema as MySQL student_db
os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
conn = sqlite3.connect(DB_FILE)
conn.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")
conn.commit()
conn.close()

# In-memory session store (simulates Tomcat HttpSession)
SESSIONS = {}

class StudentPortalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def get_session(self):
        cookie_header = self.headers.get("Cookie")
        if not cookie_header:
            return None, None
        cookie = http.cookies.SimpleCookie(cookie_header)
        if "JSESSIONID" in cookie:
            sid = cookie["JSESSIONID"].value
            if sid in SESSIONS:
                return sid, SESSIONS[sid]
        return None, None

    def create_session(self, user_email, user_name, user_id, created_at):
        sid = str(uuid.uuid4()).replace("-", "")[:16]
        SESSIONS[sid] = {
            "userEmail": user_email,
            "userName": user_name,
            "userId": user_id,
            "createdAt": created_at
        }
        return sid

    def invalidate_session(self):
        sid, _ = self.get_session()
        if sid and sid in SESSIONS:
            del SESSIONS[sid]

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Root redirect to register.html
        if path == "/" or path == "":
            self.send_response(302)
            self.send_header("Location", "/register.html")
            self.end_headers()
            return

        # Step 7.3: LogoutServlet GET
        if path == "/LogoutServlet":
            self.invalidate_session()
            self.send_response(302)
            # Expire session cookie
            self.send_header("Set-Cookie", "JSESSIONID=; Path=/; Max-Age=0; HttpOnly")
            self.send_header("Location", "/login.html?loggedOut=true")
            self.end_headers()
            return

        # Step 7: Protected Dashboard (dashboard.jsp)
        if path == "/dashboard.jsp":
            sid, session_data = self.get_session()
            if not session_data or not session_data.get("userEmail"):
                # Step 7.2: Session check failed -> redirect to login.html
                self.send_response(302)
                self.send_header("Location", "/login.html?error=sessionExpired")
                self.end_headers()
                return

            # Render dashboard.jsp with user session variables
            jsp_path = os.path.join(BASE_DIR, "dashboard.jsp")
            with open(jsp_path, "r", encoding="utf-8") as f:
                content = f.read()

            user_name = session_data.get("userName", "Student")
            user_email = session_data.get("userEmail", "")
            user_id = session_data.get("userId", 1)
            created_at = session_data.get("createdAt", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            # Calculate initials
            parts = user_name.strip().split()
            initials = (parts[0][0] + (parts[1][0] if len(parts) > 1 else "")).upper()

            # Replace JSP scriplets with live evaluated values for preview
            html = content
            html = html.replace('<%= userName %>', user_name)
            html = html.replace('<%= userEmail %>', user_email)
            html = html.replace('<%= initials %>', initials)
            html = html.replace('<%= (createdAt != null ? createdAt : "Active Session") %>', str(created_at))
            html = html.replace('<%= (userId != null ? String.format("%04d", userId) : "001") %>', f"{user_id:04d}")
            html = html.replace('<%= session.getId().substring(0, Math.min(12, session.getId().length())) %>...', sid[:12] + '...')
            html = re.sub(r'<\%[\s\S]*?\%>', '', html) # remove any remaining Java scriptlet blocks

            output_bytes = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(output_bytes)))
            self.end_headers()
            self.wfile.write(output_bytes)
            return

        # Serve static files (HTML, CSS, JS, etc.)
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read POST body
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")
        params = urllib.parse.parse_qs(post_data)

        # Step 6.1: RegisterServlet POST
        if path == "/RegisterServlet":
            name = params.get("name", [""])[0].strip()
            email = params.get("email", [""])[0].strip().lower()
            password = params.get("password", [""])[0]

            if not name or not email or not password:
                self.send_response(302)
                self.send_header("Location", "/register.html?error=empty")
                self.end_headers()
                return

            try:
                c = sqlite3.connect(DB_FILE)
                cur = c.cursor()
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("INSERT INTO students (name, email, password, created_at) VALUES (?, ?, ?, ?)",
                            (name, email, password, now_str))
                c.commit()
                c.close()

                # Step 6.1: Redirect upon successful registration
                self.send_response(302)
                self.send_header("Location", "/login.html?registered=true")
                self.end_headers()
                return
            except sqlite3.IntegrityError:
                # Duplicate email
                self.send_response(302)
                self.send_header("Location", "/register.html?error=exists")
                self.end_headers()
                return
            except Exception as e:
                print(f"[RegisterServlet Exception]: {type(e).__name__}: {e}")
                self.send_response(302)
                self.send_header("Location", "/register.html?error=unknown")
                self.end_headers()
                return

        # Step 6.2: LoginServlet POST
        if path == "/LoginServlet":
            email = params.get("email", [""])[0].strip().lower()
            password = params.get("password", [""])[0]

            c = sqlite3.connect(DB_FILE)
            cur = c.cursor()
            cur.execute("SELECT id, name, email, created_at FROM students WHERE email = ? AND password = ?",
                        (email, password))
            row = cur.fetchone()
            c.close()

            if row:
                user_id, user_name, user_email, created_at = row
                # Step 6.2: Session-Based Login
                sid = self.create_session(user_email, user_name, user_id, created_at)

                self.send_response(303)
                self.send_header("Set-Cookie", f"JSESSIONID={sid}; Path=/; HttpOnly")
                self.send_header("Location", "/dashboard.jsp")
                self.end_headers()
                return
            else:
                # Step 6.2: Authentication failed
                self.send_response(303)
                self.send_header("Location", "/login.html?error=invalid")
                self.end_headers()
                return

        # Handle POST sent to dashboard.jsp by delegating to do_GET
        if path == "/dashboard.jsp":
            return self.do_GET()

        self.send_error(404, "Endpoint Not Found")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    print(f"==================================================")
    print(f" Student Registration Portal - Live Preview Server")
    print(f" http://localhost:{PORT}/")
    print(f"==================================================")
    print(f" - Servlets simulated: /RegisterServlet, /LoginServlet, /LogoutServlet")
    print(f" - Protected JSP simulated: /dashboard.jsp")
    print(f" - Static assets served from: {BASE_DIR}")
    print(f" Press Ctrl+C to terminate.")
    with ReusableTCPServer(("", PORT), StudentPortalHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
