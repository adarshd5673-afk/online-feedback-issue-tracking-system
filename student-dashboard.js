(function () {
  const navContainer = document.getElementById("studentSidebarNav");
  const pages = {
    dashboard: document.getElementById("page-dashboard"),
    "file-complaint": document.getElementById("page-file-complaint"),
    "your-complaints": document.getElementById("page-your-complaints"),
    feedback: document.getElementById("page-feedback"),
  };

  if (!navContainer) return;

  function setActivePage(targetKey) {
    // Toggle nav active state
    const links = navContainer.querySelectorAll(".navLink");
    links.forEach((btn) => {
      const key = btn.getAttribute("data-page");
      if (key === targetKey) {
        btn.classList.add("navLinkActive");
      } else {
        btn.classList.remove("navLinkActive");
      }
    });

    // Toggle page visibility
    Object.entries(pages).forEach(([key, el]) => {
      if (!el) return;
      if (key === targetKey) {
        el.classList.add("pageActive");
      } else {
        el.classList.remove("pageActive");
      }
    });
  }

  navContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".navLink");
    if (!button) return;

    const pageKey = button.getAttribute("data-page");
    if (!pageKey) return;

    setActivePage(pageKey);
  });

  // Light front-end only submit handlers to prevent reloads
  function attachFormHandler(id, successMessage) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert(successMessage);
    });
  }

  // attachFormHandler(
  //   "fileComplaintForm",
  //   "Complaint submitted (frontend preview only)."
  // );
  // attachFormHandler(
  //   "feedbackForm",
  //   "Feedback submitted (frontend preview only)."
  // );
})();

function showToast(message, type = "success") {//complain submit popup ui
  const popup = document.createElement("div");

  const bgColor = type === "success" ? "#22c55e" : "#ef4444";

  popup.innerHTML = `
    <div style="
      position:fixed;
      top:20px;
      right:20px;
      background:${bgColor};
      color:white;
      padding:12px 20px;
      border-radius:8px;
      box-shadow:0 5px 15px rgba(0,0,0,0.3);
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

document.getElementById("fileComplaintForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("complaintTitle").value;
  const category = document.getElementById("complaintCategory").value;
  const description = document.getElementById("complaintDescription").value;

  if (!title || !category || !description) {
  showToast("All fields are required ❌", "error");
  return;
}

  try {
    const res = await fetch("http://localhost:3000/complaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")
      },
      body: JSON.stringify({ title, category, description })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message || "Complaint submitted successfully ✅");

      // ✅ form reset
      document.getElementById("fileComplaintForm").reset();

      // ✅ refresh complaints
      loadMyComplaints();

    } else {
      showToast(data.message || "Failed to submit ❌", "error");
    }

  } catch (err) {
    console.log(err);
    showToast("Server error ❌", "error");
  }
});

// LOAD USER COMPLAINTS
async function loadMyComplaints() {
  try {
    const res = await fetch("http://localhost:3000/my-complaints", {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });

    const data = await res.json();

    console.log("My complaints:", data);

    //  Dashboard table
    const dashboardTable = document.querySelector("#myComplaintsTable tbody");
    dashboardTable.innerHTML = "";

    //  Your complaints table
    const yourTable = document.querySelector("#page-your-complaints tbody");
    yourTable.innerHTML = "";

    data.forEach(c => {

      //  Dashboard Recent Complaints
      dashboardTable.innerHTML += `
        <tr>
          <td>${c._id}</td>
          <td>${c.title}</td>
          <td>${c.category}</td>
          <td>${c.status}</td>
          <td>${c.date}</td>
        </tr>
      `;

      //  Your Complaints with VIEW BUTTON
      yourTable.innerHTML += `
        <tr>
          <td>${c._id}</td>
          <td>${c.category}</td>
          <td>${c.date}</td>
          <td>${c.status}</td>
          <td>
          <button onclick="viewComplaint('${c.description}')">View</button>
          <button onclick="deleteComplaint('${c._id}')">Delete</button>
           </td>
        </tr>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}

// CALL FUNCTION ON PAGE LOAD
loadMyComplaints();


function showConfirmPopup(message, onConfirm) {
  const modal = document.createElement("div");

  modal.innerHTML = `
    <div style="
      position:fixed;
      top:0; left:0;
      width:100%; height:100%;
      background:rgba(0,0,0,0.6);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:1000;
    ">
      <div style="
        background:#1e293b;
        color:#ffffff;
        padding:24px;
        border-radius:12px;
        width:350px;
        max-width:90%;
        text-align:center;
        box-shadow:0 10px 30px rgba(0,0,0,0.5);
      ">
        <h3 style="margin-bottom:10px; font-size:18px;">
          Confirm Action
        </h3>

        <p style="
          margin-bottom:20px;
          color:#cbd5f5;
          line-height:1.5;
        ">
          ${message}
        </p>

        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">
          <button id="cancelBtn" style="
            flex:1;
            padding:10px;
            border:none;
            background:#64748b;
            color:white;
            border-radius:8px;
            cursor:pointer;
          ">
            Cancel
          </button>

          <button id="confirmBtn" style="
            flex:1;
            padding:10px;
            border:none;
            background:#ef4444;
            color:white;
            border-radius:8px;
            cursor:pointer;
          ">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#cancelBtn").onclick = () => modal.remove();

  modal.querySelector("#confirmBtn").onclick = () => {
    onConfirm();
    modal.remove();
  };

  // outside click close
  modal.firstElementChild.onclick = (e) => {
    if (e.target === modal.firstElementChild) modal.remove();
  };
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
    ">
      ${message}
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}

function deleteComplaint(id) {

  showConfirmPopup("Are you sure you want to delete this complaint?", async () => {

    try {
      const res = await fetch(`http://localhost:3000/complaint/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token")
        }
      });

      const data = await res.json();

      showSuccessPopup(data.message || "Deleted successfully");

      loadMyComplaints(); // refresh

    } catch (err) {
      console.log(err);
      showSuccessPopup("Delete failed ❌");
    }

  });
}

function viewComplaint(description) {//discription modern ui

  const overlay = document.createElement("div");

  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  overlay.innerHTML = `
    <div style="
      background:#0f172a;
      color:white;
      padding:20px;
      border-radius:12px;
      width:350px;
      max-width:90%;
      box-shadow:0 10px 30px rgba(0,0,0,0.5);
    ">
      <h3 style="margin-bottom:10px;">Complaint Description</h3>
      <p style="margin-bottom:15px; line-height:1.5;">
        ${description || "No description provided"}
      </p>
      <button id="closeModalBtn" style="
        padding:8px 16px;
        border:none;
        border-radius:6px;
        background:#ef4444;
        color:white;
        cursor:pointer;
      ">
        Close
      </button>
    </div>
  `;

  // Close button
  overlay.querySelector("#closeModalBtn").addEventListener("click", () => {
    overlay.remove();
  });

  // Click outside to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
}

document.getElementById("studentName").innerText =//Dashboard pe name show
localStorage.getItem("name") || "Student";

function logout() {//LOGOUT FUNCTION
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");

  showSuccessPopup("Logged out successfully");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}