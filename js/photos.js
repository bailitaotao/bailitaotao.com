document.addEventListener('DOMContentLoaded', () => {
  const photoWall = document.getElementById('photo-wall');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const totalPhotos = 80;
  const imageFolder = 'assets/photos/';
  let allImages = [];
  let resizeTimeout;

  // Lightbox Functions
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 300);
  }

  // Close on any click inside lightbox
  lightbox.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Configuration
  const getColumnCount = () => {
    const width = window.innerWidth;
    if (width < 600) return 2;
    if (width < 900) return 3;
    if (width < 1400) return 4;
    if (width < 1800) return 5;
    return 6;
  };

  // Generate image list
  const imageUrls = [];
  for (let i = 1; i <= totalPhotos; i++) {
    const num = i.toString().padStart(5, '0');
    imageUrls.push(`${imageFolder}web-${num}.webp`);
  }

  // Shuffle function
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  shuffle(imageUrls);

  // Load and Layout
  function init() {
    let loadedCount = 0;
    
    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      img.className = 'photo-item';
      img.alt = 'Photo';
      
      // Store metadata
      const imgData = {
        element: img,
        aspectRatio: 1, // default
        loaded: false
      };
      allImages.push(imgData);
      photoWall.appendChild(img);

      // Add click event for lightbox
      img.addEventListener('click', () => openLightbox(url));

      img.onload = () => {
        imgData.aspectRatio = img.naturalWidth / img.naturalHeight;
        imgData.loaded = true;
        loadedCount++;
        
        // Show image with fade in
        img.classList.add('visible');
        
        // Perform layout incrementally or wait? 
        // For smoother experience, we layout as they come, 
        // but to ensure "shortest column" logic works best, 
        // we should layout the ones that are ready in order.
        layout();
      };
    });
    
    photoWall.classList.add('ready');
  }

  function layout() {
    const colCount = getColumnCount();
    const wallWidth = photoWall.offsetWidth;
    const colWidth = wallWidth / colCount;
    
    // Initialize column heights
    const colHeights = new Array(colCount).fill(0);

    allImages.forEach(imgData => {
      if (!imgData.loaded) return;

      // Find shortest column
      let minHeight = Math.min(...colHeights);
      let colIndex = colHeights.indexOf(minHeight);

      // Calculate dimensions
      const width = colWidth;
      const height = width / imgData.aspectRatio;

      // Set position
      const img = imgData.element;
      img.style.width = `${Math.ceil(width)}px`; // ceil to avoid subpixel gaps
      img.style.height = `${Math.ceil(height)}px`;
      img.style.left = `${colIndex * width}px`;
      img.style.top = `${minHeight}px`;

      // Update column height
      colHeights[colIndex] += height;
    });

    // Set container height
    const maxHeight = Math.max(...colHeights);
    photoWall.style.height = `${maxHeight}px`;
  }

  // Handle resize
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(layout, 200);
  });

  init();
});
