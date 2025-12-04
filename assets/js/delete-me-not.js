document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ark-scan-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Resize handler
    const resize = () => {
        const parent = canvas.parentElement;
        width = parent.offsetWidth;
        height = parent.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Mouse handler
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
    });

    // Random data generator
    const generateHex = (length) => {
        let result = '';
        const characters = '0123456789ABCDEF';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, width, height);

        // Smooth follow
        mouseX += (targetX - mouseX) * 0.15;
        mouseY += (targetY - mouseY) * 0.15;

        // Draw Crosshair Lines
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        
        // Vertical
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, height);
        
        // Horizontal
        ctx.moveTo(0, mouseY);
        ctx.lineTo(width, mouseY);
        ctx.stroke();

        // Draw Active Scan Area (Brackets)
        const bracketSize = 20;
        const bracketGap = 10;
        ctx.strokeStyle = 'rgba(209, 179, 113, 0.8)'; // Accent color
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Top Left
        ctx.moveTo(mouseX - bracketSize - bracketGap, mouseY - bracketGap);
        ctx.lineTo(mouseX - bracketGap, mouseY - bracketGap);
        ctx.lineTo(mouseX - bracketGap, mouseY - bracketSize - bracketGap);

        // Top Right
        ctx.moveTo(mouseX + bracketSize + bracketGap, mouseY - bracketGap);
        ctx.lineTo(mouseX + bracketGap, mouseY - bracketGap);
        ctx.lineTo(mouseX + bracketGap, mouseY - bracketSize - bracketGap);

        // Bottom Left
        ctx.moveTo(mouseX - bracketSize - bracketGap, mouseY + bracketGap);
        ctx.lineTo(mouseX - bracketGap, mouseY + bracketGap);
        ctx.lineTo(mouseX - bracketGap, mouseY + bracketSize + bracketGap);

        // Bottom Right
        ctx.moveTo(mouseX + bracketSize + bracketGap, mouseY + bracketGap);
        ctx.lineTo(mouseX + bracketGap, mouseY + bracketGap);
        ctx.lineTo(mouseX + bracketGap, mouseY + bracketSize + bracketGap);
        
        ctx.stroke();

        // Draw Data Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px "Courier New", monospace';
        
        const dataX = mouseX + 40;
        const dataY = mouseY - 40;

        ctx.fillText(`POS_X: ${Math.round(mouseX).toString().padStart(4, '0')}`, dataX, dataY);
        ctx.fillText(`POS_Y: ${Math.round(mouseY).toString().padStart(4, '0')}`, dataX, dataY + 12);
        ctx.fillText(`HEX: 0x${generateHex(4)}`, dataX, dataY + 24);
        ctx.fillText(`SCAN: ACTIVE`, dataX, dataY + 36);

        // Draw connecting line to data
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.moveTo(mouseX + bracketGap, mouseY - bracketGap);
        ctx.lineTo(dataX - 5, dataY + 18);
        ctx.stroke();

        // Draw random scanning dots on the vertical line
        if (Math.random() > 0.8) {
            const dotY = Math.random() * height;
            ctx.fillStyle = 'rgba(209, 179, 113, 0.8)';
            ctx.fillRect(mouseX - 1, dotY, 3, 3);
        }

        requestAnimationFrame(animate);
    };

    animate();
});
