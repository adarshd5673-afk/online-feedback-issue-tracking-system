document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
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

  function validateRole() {
    const value = roleSelect.value;
    if (!value) {
      setError("roleField", "Please select a role.");
      return false;
    }
    setError("roleField", "");
    return true;
  }

  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);
  roleSelect.addEventListener("change", validateRole);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const okEmail = validateEmail();
    const okPassword = validatePassword();
    const okRole = validateRole();

    if (!okEmail || !okPassword || !okRole) {
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
