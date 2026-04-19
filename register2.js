document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("registerForm");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const roleSelect = document.getElementById("role");

  function setError(fieldWrapperId, message) {
    const wrapper = document.getElementById(fieldWrapperId);
    const errorEl = wrapper?.querySelector(".error");

    if (message) {
      wrapper.classList.add("hasError");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("hasError");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validate() {
    let valid = true;

    if (!nameInput.value.trim()) {
      setError("nameField", "Name is required");
      valid = false;
    } else setError("nameField", "");

    if (!emailInput.value.trim()) {
      setError("emailField", "Email required");
      valid = false;
    } else setError("emailField", "");

    if (passwordInput.value.length < 6) {
      setError("passwordField", "Min 6 chars");
      valid = false;
    } else setError("passwordField", "");

    if (confirmPasswordInput.value !== passwordInput.value) {
      setError("confirmPasswordField", "Passwords not match");
      valid = false;
    } else setError("confirmPasswordField", "");

    if (!roleSelect.value) {
      setError("roleField", "Select role");
      valid = false;
    } else setError("roleField", "");

    return valid;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value,
          role: roleSelect.value
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Registration successful!");

      localStorage.setItem("currentUser", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "student-dashboard.html";
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });

});