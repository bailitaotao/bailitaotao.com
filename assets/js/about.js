document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.createElement("div");
  tooltip.className = "game-tooltip";
  document.body.appendChild(tooltip);

  const gameItems = document.querySelectorAll(".game-item");
  let tooltipTimeout;

  gameItems.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      const description = item.getAttribute("data-description");
      if (description) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
          tooltip.textContent = description;
          tooltip.classList.add("visible");
        }, 300); // 0.3s delay
      }
    });

    item.addEventListener("mousemove", (e) => {
      const x = e.pageX + 15; // 15px offset to the right
      const y = e.pageY + 15; // 15px offset to the bottom
      
      // Prevent tooltip from going off-screen
      const tooltipRect = tooltip.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let finalX = x;
      let finalY = y;

      if (x + tooltipRect.width > windowWidth) {
        finalX = e.pageX - tooltipRect.width - 15;
      }
      if (y + tooltipRect.height > windowHeight + window.scrollY) {
        finalY = e.pageY - tooltipRect.height - 15;
      }

      tooltip.style.left = `${finalX}px`;
      tooltip.style.top = `${finalY}px`;
    });

    item.addEventListener("mouseleave", () => {
      clearTimeout(tooltipTimeout);
      tooltip.classList.remove("visible");
    });
  });

  // Lightbox Logic
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const calliItems = document.querySelectorAll(".calli-item img");

  if (lightbox && lightboxImg) {
    calliItems.forEach((img) => {
      img.parentElement.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    lightbox.addEventListener("click", () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        lightboxImg.src = "";
      }, 300);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Horizontal Scroll Buttons Logic
  const initScrollContainers = () => {
    const wrappers = document.querySelectorAll(".scroll-container-wrapper");

    wrappers.forEach((wrapper) => {
      const scrollContainer = wrapper.querySelector(".horizontal-scroll");
      const prevBtn = wrapper.querySelector(".scroll-btn-prev");
      const nextBtn = wrapper.querySelector(".scroll-btn-next");

      if (!scrollContainer || !prevBtn || !nextBtn) return;

      const updateButtons = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        
        // Show/hide prev button
        if (scrollLeft > 5) {
          prevBtn.classList.add("visible");
        } else {
          prevBtn.classList.remove("visible");
        }

        // Show/hide next button
        if (scrollLeft + clientWidth < scrollWidth - 5) {
          nextBtn.classList.add("visible");
        } else {
          nextBtn.classList.remove("visible");
        }
      };

      prevBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
          left: -scrollContainer.clientWidth * 0.8,
          behavior: "smooth",
        });
      });

      nextBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
          left: scrollContainer.clientWidth * 0.8,
          behavior: "smooth",
        });
      });

      scrollContainer.addEventListener("scroll", updateButtons);
      window.addEventListener("resize", updateButtons);
      
      // Initial check
      setTimeout(updateButtons, 100);
    });
  };

  initScrollContainers();
});
