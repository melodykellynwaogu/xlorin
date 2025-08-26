document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll("button[data-target]").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return; // safety check
      target.classList.toggle("open"); // toggle show/hide
    });
  });

  // initialize feather icons if you're using them
  if (window.feather) {
    feather.replace();
  }
});