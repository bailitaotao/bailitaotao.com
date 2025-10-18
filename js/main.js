document.addEventListener("DOMContentLoaded", () => {
  // Dropdown menu logic
  const dropdowns = document.querySelectorAll(".has-dropdown");
  const header = document.querySelector("header");
  const overlay = document.querySelector(".overlay");
  let activeDropdown = null;

  dropdowns.forEach(dropdown => {
    dropdown.addEventListener("mouseenter", () => {
      // Disable transition when switching between active dropdowns
      if (activeDropdown) {
        dropdowns.forEach(d => d.classList.add("no-transition"));
      }
      
      // Update active states
      dropdowns.forEach(d => d.classList.remove("active"));
      dropdown.classList.add("active");
      overlay.classList.add("active");
      header.classList.add("solid");
      activeDropdown = dropdown;
      
      // Re-enable transitions
      if (dropdowns.length > 1) {
        setTimeout(() => dropdowns.forEach(d => d.classList.remove("no-transition")), 50);
      }
    });
  });

  header.addEventListener("mouseleave", () => {
    closeAllDropdowns();
  });

  // Close dropdowns when scrolling
  window.addEventListener("wheel", () => {
    if (activeDropdown) {
      closeAllDropdowns();
    }
  }, { passive: true });

  // Helper function to close all dropdowns
  function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove("active"));
    overlay.classList.remove("active");
    header.classList.remove("solid");
    activeDropdown = null;
  }

  // Announcement banner logic (only for pages with addressnake.js)
  const announcementBanner = document.getElementById("announcementBanner");
  if (announcementBanner) {
    const closeButton = document.getElementById("closeAnnouncement");
    const storageKey = "addressnake-announcement-dismissed";
    
    // Check if announcement was previously dismissed
    const wasDismissed = localStorage.getItem(storageKey);
    
    if (wasDismissed) {
      // Hide immediately without transition
      announcementBanner.style.display = "none";
    } else {
      // Show announcement
      document.body.classList.add("announcement-visible");
      
      // Close button handler
      closeButton.addEventListener("click", () => {
        announcementBanner.classList.add("hidden");
        document.body.classList.remove("announcement-visible");
        localStorage.setItem(storageKey, "true");
        
        // Remove from DOM after transition
        setTimeout(() => {
          announcementBanner.style.display = "none";
        }, 300);
      });
    }
  }

  // Video controls logic
  const video = document.getElementById("cover-video");
  const videoMuteButton = document.getElementById("videoMuteButton");
  const videoReplayButton = document.getElementById("videoReplayButton");

  if (video && videoMuteButton) {
    // Set initial button state on page load
    const updateMuteButton = () => {
      videoMuteButton.classList.toggle("muted", video.muted);
      videoMuteButton.title = video.muted ? "Unmute" : "Mute";
    };
    updateMuteButton();

    videoMuteButton.addEventListener("click", () => {
      video.muted = !video.muted;
      updateMuteButton();
    });
  }

  if (video && videoReplayButton) {
    videoReplayButton.addEventListener("click", () => {
      video.currentTime = 0;
      video.play();
    });
  }
});
