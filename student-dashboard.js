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

  attachFormHandler(
    "fileComplaintForm",
    "Complaint submitted (frontend preview only)."
  );
  attachFormHandler(
    "feedbackForm",
    "Feedback submitted (frontend preview only)."
  );
})();

