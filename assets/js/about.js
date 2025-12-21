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
});
