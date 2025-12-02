document.addEventListener("DOMContentLoaded", () => {
  // Load shared navigation markup, then initialize dropdown behavior
  const loadNav = async () => {
    const container = document.getElementById("nav-container");
    if (!container) return;
    try {
      const res = await fetch("/nav.html", { cache: "no-cache" });
      const html = await res.text();
      container.innerHTML = html;
      initNavBehavior();
    } catch (e) {
      console.error("Failed to load nav:", e);
    }
  };

  const loadFooter = async () => {
    const container = document.getElementById("footer-container");
    if (!container) return;
    try {
      const res = await fetch("/footer.html", { cache: "no-cache" });
      container.innerHTML = await res.text();
    } catch (e) {
      console.error("Failed to load footer:", e);
    }
  };

  const initNavBehavior = () => {
    const dropdowns = document.querySelectorAll(".has-dropdown");
    const header = document.querySelector("header");
    const overlay = document.querySelector(".overlay");
    if (!dropdowns.length || !header || !overlay) return;

    let activeDropdown = null;

    dropdowns.forEach(dropdown => {
      dropdown.addEventListener("mouseenter", () => {
        if (activeDropdown) dropdowns.forEach(d => d.classList.add("no-transition"));
        dropdowns.forEach(d => d.classList.remove("active"));
        dropdown.classList.add("active");
        overlay.classList.add("active");
        header.classList.add("solid");
        activeDropdown = dropdown;
        if (dropdowns.length > 1) setTimeout(() => dropdowns.forEach(d => d.classList.remove("no-transition")), 50);
      });
    });

    const closeAllDropdowns = () => {
      dropdowns.forEach(d => d.classList.remove("active"));
      overlay.classList.remove("active");
      header.classList.remove("solid");
      activeDropdown = null;
    };

    header.addEventListener("mouseleave", closeAllDropdowns);
    window.addEventListener("wheel", () => { if (activeDropdown) closeAllDropdowns(); }, { passive: true });
  };

  loadNav();
  loadFooter();

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

  // Set video volume to 30%
  if (video) {
    video.volume = 0.3;
  }

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

  // Carousel functionality
  const initCarousel = () => {
    const track = document.querySelector(".carousel-track");
    const items = document.querySelectorAll(".carousel-item");
    const prevBtn = document.querySelector(".carousel-btn-prev");
    const nextBtn = document.querySelector(".carousel-btn-next");
    const indicators = document.querySelectorAll(".carousel-indicator");
    
    if (!track || !items.length) return;

    let currentIndex = 0;
    let autoPlayInterval = null;

    const getItemWidth = () => {
      // 动态获取item宽度和gap
      const item = items[0];
      const style = window.getComputedStyle(item);
      const itemWidth = item.offsetWidth;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap) || 0;
      return itemWidth + gap;
    };

    const updateCarousel = (animate = true) => {
      if (!animate) {
        track.style.transition = "none";
      }
      
      // 使用动态计算的宽度
      const itemWidth = getItemWidth();
      const offset = -currentIndex * itemWidth;
      track.style.transform = `translateX(${offset}px)`;
      
      // Update active states
      items.forEach((item, index) => {
        if (index === currentIndex) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Update indicators
      indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });

      // Re-enable transition after a frame
      if (!animate) {
        requestAnimationFrame(() => {
          track.style.transition = "";
        });
      }
    };

    const goToSlide = (index, animate = true) => {
      currentIndex = (index + items.length) % items.length;
      updateCarousel(animate);
    };

    const nextSlide = () => {
      goToSlide(currentIndex + 1);
    };

    const prevSlide = () => {
      goToSlide(currentIndex - 1);
    };

    const startAutoPlay = () => {
      stopAutoPlay(); // 确保清除旧的定时器
      autoPlayInterval = setInterval(nextSlide, 3000);
    };

    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    };

    // Event listeners
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        prevSlide();
        startAutoPlay(); // 重置定时器
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        nextSlide();
        startAutoPlay(); // 重置定时器
      });
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        goToSlide(index);
        startAutoPlay(); // 重置定时器
      });
    });

    // Pause autoplay on hover
    const carouselContainer = document.querySelector(".carousel-container");
    if (carouselContainer) {
      carouselContainer.addEventListener("mouseenter", stopAutoPlay);
      carouselContainer.addEventListener("mouseleave", startAutoPlay);
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        startAutoPlay(); // 重置定时器
      } else if (e.key === "ArrowRight") {
        nextSlide();
        startAutoPlay(); // 重置定时器
      }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCarousel(false);
      }, 150);
    });

    // Initialize
    updateCarousel(false);
    startAutoPlay();
  };

  initCarousel();

  // Lightbox functionality
  const initLightbox = () => {
    // Create lightbox element if it doesn't exist
    if (!document.getElementById('lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = '<img id="lightbox-img" src="" alt="Lightbox Image">';
      document.body.appendChild(lightbox);
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    const openLightbox = (src) => {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    };

    // Event listeners for closing
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Attach click listeners to zoomable images
    const attachZoomListeners = () => {
      const zoomableImages = document.querySelectorAll('.zoomable');
      zoomableImages.forEach(img => {
        img.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent bubbling
          openLightbox(img.src);
        });
      });
    };

    attachZoomListeners();
  };

  initLightbox();
});
