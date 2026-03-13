document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const roleSelect = document.getElementById("role");

  function setError(fieldWrapperId, message) {
    const wrapper = document.getElementById(fieldWrapperId);
    if (!wrapper) return;
    const errorEl = wrapper.querySelector(".error");
    if (message) {
      wrapper.classList.add("hasError");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("hasError");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      setError("nameField", "Name is required.");
      return false;
    }
    if (value.length < 2) {
      setError("nameField", "Name must be at least 2 characters.");
      return false;
    }
    setError("nameField", "");
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setError("emailField", "College email is required.");
      return false;
    }
    const emailPattern = /^[^\s@]+@mitsgwl\.ac\.in$/i;
    if (!emailPattern.test(value)) {
      setError("emailField", "Use your college email (e.g. 25ad1ad5@mitsgwl.ac.in).");
      return false;
    }
    setError("emailField", "");
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      setError("passwordField", "Password is required.");
      return false;
    }
    if (value.length < 6) {
      setError("passwordField", "Password must be at least 6 characters.");
      return false;
    }
    setError("passwordField", "");
    return true;
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    if (!value) {
      setError("confirmPasswordField", "Please confirm your password.");
      return false;
    }
    if (value !== passwordInput.value) {
      setError("confirmPasswordField", "Passwords do not match.");
      return false;
    }
    setError("confirmPasswordField", "");
    return true;
  }

  function validateRole() {
    const value = roleSelect.value;
    if (!value) {
      setError("roleField", "Please select a role.");
      return false;
    }
    setError("roleField", "");
    return true;
  }

  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", () => {
    validatePassword();
    if (confirmPasswordInput.value) validateConfirmPassword();
  });
  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
  roleSelect.addEventListener("change", validateRole);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const okName = validateName();
    const okEmail = validateEmail();
    const okPassword = validatePassword();
    const okConfirm = validateConfirmPassword();
    const okRole = validateRole();

    if (!okName || !okEmail || !okPassword || !okConfirm || !okRole) {
      return;
    }

    const role = roleSelect.value;

    if (role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      // student / teacher / others go to student dashboard
      window.location.href = "student-dashboard.html";
    }
  });
});
