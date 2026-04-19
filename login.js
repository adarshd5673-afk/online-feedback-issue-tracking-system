document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Error display function
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

  function showSuccessPopup(message) {
  const popup = document.createElement("div");

  popup.innerHTML = `
    <div style="
      position:fixed;
      top:20px;
      right:20px;
      background:#2ecc71;
      color:white;
      padding:12px 20px;
      border-radius:8px;
      box-shadow:0 5px 15px rgba(0,0,0,0.2);
      z-index:1000;
      font-size:14px;
    ">
      ${message}
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}
  // Email validation
  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
      setError("emailField", "College email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@mitsgwl\.ac\.in$/i;
    if (!emailPattern.test(value)) {
      setError(
        "emailField",
        "Use your college email (e.g. 25ad1ad5@mitsgwl.ac.in)."
      );
      return false;
    }

    setError("emailField", "");
    return true;
  }

  // Password validation
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

  // Blur validation
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  // Submit event
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const okEmail = validateEmail();
    const okPassword = validatePassword();

    if (!okEmail || !okPassword) {
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // ✅ Save token, role, name
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      showSuccessPopup("Login successful");

// ⏳ Delay for popup
      setTimeout(() => {
      if (data.role === "admin") {
      window.location.href = "admin-dashboard.html";
      } else {
      window.location.href = "student-dashboard.html";
      }
        }, 1200); // 1.2 sec delay

    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  });
});