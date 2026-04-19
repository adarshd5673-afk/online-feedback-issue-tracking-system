// Keep in sync with unified-learning-hub version
(function () {
  const navContainer = document.getElementById("adminSidebarNav");
  const pages = {
    dashboard: document.getElementById("admin-page-dashboard"),
    complaints: document.getElementById("admin-page-complaints"),
  };

  if (!navContainer) return;

  function setActivePage(targetKey) {
    const links = navContainer.querySelectorAll(".navLink");
    links.forEach((btn) => {
      const key = btn.getAttribute("data-page");
      if (key === targetKey) {
        btn.classList.add("navLinkActive");
      } else {
        btn.classList.remove("navLinkActive");
      }
    });

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
    if (!button || button.disabled) return;
    const pageKey = button.getAttribute("data-page");
    if (!pageKey) return;
    setActivePage(pageKey);
  });

  // Simple front-end-only status change handling
  const tableBody = document.getElementById("adminComplaintsTableBody");
  if (tableBody) {
    tableBody.addEventListener("change", (event) => {
      const select = event.target.closest(".statusSelect");
      if (!select) return;

      const row = select.closest("tr");
      if (!row) return;

      const statusCell = row.querySelector(".statusBadge");
      if (!statusCell) return;

      const value = select.value;

      statusCell.classList.remove(
        "statusSubmitted",
        "statusPending",
        "statusProgress",
        "statusResolved"
      );

      const dot = statusCell.querySelector(".statusDot");
      if (!dot) return;

      if (value === "submitted") {
        statusCell.classList.add("statusSubmitted");
        statusCell.lastChild.textContent = " Submitted";
      } else if (value === "in-progress") {
        statusCell.classList.add("statusProgress");
        statusCell.lastChild.textContent = " In Progress";
      } else if (value === "resolved") {
        statusCell.classList.add("statusResolved");
        statusCell.lastChild.textContent = " Resolved";
      }
    });

    tableBody.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest(".dangerLink");
      if (!deleteBtn) return;
      event.preventDefault();
      const row = deleteBtn.closest("tr");
      if (!row) return;
      const idCell = row.querySelector("td");
      const id = idCell ? idCell.textContent : "this complaint";
      const confirmed = window.confirm(
        `Pretend delete: remove ${id}? (Frontend mock only.)`
      );
      if (confirmed) {
        row.remove();
      }
    });
  }
})();

function showToast(message, type = "success") { // STATUS CHANGE UI FUNCTION
  const toast = document.createElement("div");

  toast.innerText = message;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
  toast.style.zIndex = "1000";
  toast.style.transition = "all 0.3s ease";

  // 🔥 TYPE BASED COLORS
  if (type === "success") {
    toast.style.background = "#2ecc71"; // green
  } else if (type === "error") {
    toast.style.background = "#e74c3c"; // red
  } else if (type === "warning") {
    toast.style.background = "#f39c12"; // orange
  }

  document.body.appendChild(toast);

  // fade out animation
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
  }, 2500);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function loadComplaints(type = "dashboard") {

  const res = await fetch("http://localhost:3000/complaints", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  const data = await res.json();

  if (!Array.isArray(data)) {
    console.log("Error:", data.message);
    alert(data.message);
    return;
  }

  let table;

  // ✅ Dashboard table (first tbody of dashboard section)
  if (type === "dashboard") {
    table = document.querySelector("#admin-page-dashboard tbody");
  } 
  
  // ✅ Complaints page table (already has id)
  else {
    table = document.getElementById("adminComplaintsTableBody");
  }

  table.innerHTML = "";

  data.forEach(c => {

    // 🔹 DASHBOARD VIEW (simple)
    if (type === "dashboard") {
      table.innerHTML += `
        <tr>
          <td>${c._id}</td>
          <td>${c.name || "Student"}</td>
          <td>${c.category}</td>
          <td>${c.date}</td>
          <td>${c.status}</td>
        </tr>
      `;
    }

    // 🔹 FULL COMPLAINTS PAGE
    else {
      table.innerHTML += `
        <tr>
          <td>${c._id}</td>
          <td>${c.name || "Student"}</td>
          <td>${c.category}</td>
          <td>${c.date}</td>
          <td>${c.status}</td>
          <td>
            <div class="tableActions">

              <button onclick="viewComplaint('${c.description}')">
                View
              </button>

              <select onchange="updateStatus('${c._id}', this.value)">
                <option ${c.status==="Submitted"?"selected":""}>Submitted</option>
                <option ${c.status==="In Progress"?"selected":""}>In Progress</option>
                <option ${c.status==="Resolved"?"selected":""}>Resolved</option>
              </select>

            </div>
          </td>
        </tr>
      `;
    }

  });
}

// Page load pe dashboard
loadComplaints("dashboard");

// Navigation handle
document.querySelectorAll(".navLink").forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.dataset.page === "dashboard") {
      loadComplaints("dashboard");
    }

    if (btn.dataset.page === "complaints") {
      loadComplaints("complaints");
    }

  });
});

async function updateStatus(id, status) {
  try {
    const res = await fetch(`http://localhost:3000/complaint/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Update failed", "error");//Error case:
      return;
    }

    showToast("Status updated successfully", "success");

    loadComplaints("complaints"); // refresh table

  } catch (err) {
    console.log(err);
    showToast("Server error ❌");
  }
}

async function deleteComplaint(id) { //Delete Function

  const confirmDelete = confirm("Are you sure you want to delete?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/complaint/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });

    const data = await res.json();

    alert(data.message);
    showToast("Complaint deleted successfully", "success");
    loadMyComplaints(); // refresh table

  } catch (err) {
    console.log(err);
    alert("Delete failed");
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
    ">
      ${message}
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}

function viewComplaint(description) {  // cards show for discription

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

document.getElementById("adminName").innerText = //Dashboard pe name show
  localStorage.getItem("name") || "Admin";

function logout() {
  // ❌ remove old data
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");

  showSuccessPopup("Logged out successfully");

  // ⏳ thoda delay (UX smooth)
  setTimeout(() => {
    window.location.href = "login.html";
  }, 800);
}