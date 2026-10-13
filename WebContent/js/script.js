/**
 * Student Registration Portal - Client-Side Validation
 * Strictly implements Step 4 from project specification:
 * - DOM element fetching via document.getElementById
 * - Submit event listener on registration & login forms
 * - Field emptiness check
 * - Regular Expression (Regex) validation for email
 * - Password length check (minimum 6 characters)
 * - Dynamic error display via DOM manipulation & event.preventDefault()
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check for URL query params to display system alerts
  handleUrlParams();

  // Initialize Registration Form Validation
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    initRegisterValidation(registerForm);
  }

  // Initialize Login Form Validation
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    initLoginValidation(loginForm);
  }

  // Setup Password Visibility Toggles
  setupPasswordToggles();
});

/**
 * Validates the Registration Form using DOM Manipulation
 * @param {HTMLFormElement} form
 */
function initRegisterValidation(form) {
  // 1. Fetch form input elements using DOM methods
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Regex patterns
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[A-Za-z\s]{2,60}$/;

  // Setup live password strength meter
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      updatePasswordStrength(passwordInput.value);
    });
  }

  // Real-time input listeners to clear error states as user types
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        clearFieldError(input);
      });
    }
  });

  // 2. Add an event listener to the form's submit event
  form.addEventListener("submit", (event) => {
    let isValid = true;

    // --- A. Validate Full Name ---
    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (nameVal === "") {
      showFieldError(nameInput, "Full Name is required.");
      isValid = false;
    } else if (!nameRegex.test(nameVal)) {
      showFieldError(nameInput, "Please enter a valid name (letters only, min 2 characters).");
      isValid = false;
    } else {
      markFieldValid(nameInput);
    }

    // --- B. Validate Email Format with Regex ---
    const emailVal = emailInput ? emailInput.value.trim() : "";
    if (emailVal === "") {
      showFieldError(emailInput, "Email address is required.");
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showFieldError(emailInput, "Please enter a valid email address (e.g., student@domain.com).");
      isValid = false;
    } else {
      markFieldValid(emailInput);
    }

    // --- C. Validate Password Length Requirements ---
    const passVal = passwordInput ? passwordInput.value : "";
    if (passVal === "") {
      showFieldError(passwordInput, "Password is required.");
      isValid = false;
    } else if (passVal.length < 6) {
      showFieldError(passwordInput, "Password must be at least 6 characters long.");
      isValid = false;
    } else {
      markFieldValid(passwordInput);
    }

    // --- D. Validate Password Confirmation (if present) ---
    if (confirmPasswordInput) {
      const confirmVal = confirmPasswordInput.value;
      if (confirmVal === "") {
        showFieldError(confirmPasswordInput, "Please confirm your password.");
        isValid = false;
      } else if (confirmVal !== passVal) {
        showFieldError(confirmPasswordInput, "Passwords do not match.");
        isValid = false;
      } else {
        markFieldValid(confirmPasswordInput);
      }
    }

    // --- E. Prevent Form Submission If Validation Fails ---
    if (!isValid) {
      event.preventDefault();
      // Apply shake animation to card for dynamic user feedback
      const authCard = document.querySelector(".auth-card");
      if (authCard) {
        authCard.classList.remove("shake");
        // Trigger reflow to restart animation
        void authCard.offsetWidth;
        authCard.classList.add("shake");
      }
    }
  });
}

/**
 * Validates the Login Form using DOM Manipulation
 * @param {HTMLFormElement} form
 */
function initLoginValidation(form) {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  [emailInput, passwordInput].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        clearFieldError(input);
      });
    }
  });

  form.addEventListener("submit", (event) => {
    let isValid = true;

    // Validate Email
    const emailVal = emailInput ? emailInput.value.trim() : "";
    if (emailVal === "") {
      showFieldError(emailInput, "Email is required.");
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showFieldError(emailInput, "Please enter a valid email format.");
      isValid = false;
    } else {
      markFieldValid(emailInput);
    }

    // Validate Password
    const passVal = passwordInput ? passwordInput.value : "";
    if (passVal === "") {
      showFieldError(passwordInput, "Password is required.");
      isValid = false;
    } else {
      markFieldValid(passwordInput);
    }

    if (!isValid) {
      event.preventDefault();
      const authCard = document.querySelector(".auth-card");
      if (authCard) {
        authCard.classList.remove("shake");
        void authCard.offsetWidth;
        authCard.classList.add("shake");
      }
    }
  });
}

/**
 * DOM Manipulation: Dynamically shows error message below input
 */
function showFieldError(inputElement, errorMessage) {
  if (!inputElement) return;

  inputElement.classList.add("is-invalid");
  inputElement.classList.remove("is-valid");

  // Locate the error container by ID or parent element
  const errorContainerId = inputElement.id + "Error";
  let errorElement = document.getElementById(errorContainerId);

  if (!errorElement) {
    // If not present, create it dynamically via DOM manipulation
    errorElement = document.createElement("div");
    errorElement.id = errorContainerId;
    errorElement.className = "error-feedback";
    inputElement.closest(".form-group-custom").appendChild(errorElement);
  }

  errorElement.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${errorMessage}`;
  errorElement.classList.add("show");
}

/**
 * DOM Manipulation: Clears error message and classes
 */
function clearFieldError(inputElement) {
  if (!inputElement) return;

  inputElement.classList.remove("is-invalid");
  const errorContainerId = inputElement.id + "Error";
  const errorElement = document.getElementById(errorContainerId);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }
}

/**
 * Marks field as valid
 */
function markFieldValid(inputElement) {
  if (!inputElement) return;
  inputElement.classList.remove("is-invalid");
  inputElement.classList.add("is-valid");
  const errorContainerId = inputElement.id + "Error";
  const errorElement = document.getElementById(errorContainerId);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }
}

/**
 * Dynamic Password Strength Meter
 */
function updatePasswordStrength(password) {
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");
  if (!strengthFill || !strengthText) return;

  if (!password || password.length === 0) {
    strengthFill.style.width = "0%";
    strengthFill.style.backgroundColor = "#e2e8f0";
    strengthText.textContent = "Strength: None";
    return;
  }

  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  if (score < 40) {
    strengthFill.style.width = "30%";
    strengthFill.style.backgroundColor = "#f43f5e"; // Rose
    strengthText.textContent = "Strength: Weak";
    strengthText.style.color = "#f43f5e";
  } else if (score < 75) {
    strengthFill.style.width = "65%";
    strengthFill.style.backgroundColor = "#f59e0b"; // Amber
    strengthText.textContent = "Strength: Moderate";
    strengthText.style.color = "#f59e0b";
  } else {
    strengthFill.style.width = "100%";
    strengthFill.style.backgroundColor = "#10b981"; // Emerald
    strengthText.textContent = "Strength: Strong";
    strengthText.style.color = "#10b981";
  }
}

/**
 * Password Visibility Toggle
 */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".btn-toggle-password");
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const isPassword = targetInput.type === "password";
      targetInput.type = isPassword ? "text" : "password";

      const icon = btn.querySelector("i");
      if (icon) {
        if (isPassword) {
          icon.classList.remove("bi-eye");
          icon.classList.add("bi-eye-slash");
        } else {
          icon.classList.remove("bi-eye-slash");
          icon.classList.add("bi-eye");
        }
      }
    });
  });
}

/**
 * Reads URL search parameters to render dynamic feedback alerts
 */
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const alertContainer = document.getElementById("serverAlertContainer");
  if (!alertContainer) return;

  if (params.get("registered") === "true") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-success">
        <i class="bi bi-check-circle-fill fs-5"></i>
        <div><strong>Registration Successful!</strong> Please sign in with your credentials.</div>
      </div>
    `;
  } else if (params.get("error") === "invalid") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-danger">
        <i class="bi bi-x-circle-fill fs-5"></i>
        <div><strong>Login Failed:</strong> Invalid email or password. Please try again.</div>
      </div>
    `;
  } else if (params.get("error") === "exists") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-danger">
        <i class="bi bi-exclamation-triangle-fill fs-5"></i>
        <div><strong>Account Exists:</strong> An account with this email is already registered. Please login.</div>
      </div>
    `;
  } else if (params.get("error") === "empty") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-danger">
        <i class="bi bi-exclamation-circle-fill fs-5"></i>
        <div><strong>Validation Error:</strong> All fields are required.</div>
      </div>
    `;
  } else if (params.get("error") === "sessionExpired") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-info">
        <i class="bi bi-info-circle-fill fs-5"></i>
        <div><strong>Session Expired:</strong> Please sign in again to access the portal.</div>
      </div>
    `;
  } else if (params.get("loggedOut") === "true") {
    alertContainer.innerHTML = `
      <div class="alert-custom alert-custom-info">
        <i class="bi bi-check2-circle fs-5"></i>
        <div>You have been safely logged out.</div>
      </div>
    `;
  }
}
