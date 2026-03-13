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

