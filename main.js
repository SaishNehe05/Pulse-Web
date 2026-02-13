/**
 * Pulse Interactive Landing Page
 * Creative Multi-Orb Spring Physics System + Navbar Interaction
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pulse: Creative Glow & Navbar Initialized');

    const root = document.documentElement;
    const navbar = document.querySelector('.navbar'); // Target the navbar
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mouse state
    let mouseX = width / 2;
    let mouseY = height / 2;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    let velocity = 0;

    // Interaction Flag
    let hasInteracted = false;

    // Initial Positions (Split Corners)
    // Orb 1 (Purple): Top Right
    const startX1 = width * 0.8;
    const startY1 = height * 0.2;

    // Orb 2 (Orange): Bottom Left
    const startX2 = width * 0.2;
    const startY2 = height * 0.8;

    // Config for 2 orbs with individual targets
    const orbs = [
        {
            x: startX1,
            y: startY1,
            targetX: startX1,
            targetY: startY1,
            vx: 0,
            vy: 0,
            stiffness: 0.02, // Increased base stiffness (was 0.007)
            damping: 0.82,
            mass: 12.0 // Slightly lighter mass for speed
        },
        {
            x: startX2,
            y: startY2,
            targetX: startX2,
            targetY: startY2,
            vx: 0,
            vy: 0,
            stiffness: 0.015, // Increased base stiffness (was 0.004)
            damping: 0.85,
            mass: 15.0 // Slightly lighter mass for speed
        }
    ];

    // --- NEW: Navbar Scroll Logic ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Calculate velocity for dynamic scaling
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        velocity = Math.sqrt(dx * dx + dy * dy);

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    });

    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }, { passive: true });

    const featuresSection = document.querySelector('#features');
    let isInFeatures = false;

    // Optimized section detection using IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isInFeatures = entry.isIntersecting;
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the section is visible

    observer.observe(featuresSection);

    function animate() {
        orbs.forEach((orb, i) => {
            // 1. Proximity waking
            if (!hasInteracted) {
                const distToCorner = Math.sqrt(Math.pow(mouseX - orb.targetX, 2) + Math.pow(mouseY - orb.targetY, 2));
                if (distToCorner < 250) {
                    hasInteracted = true;
                }
            }

            // 2. State-based target assignment
            if (isInFeatures) {
                // Split: Purple Left, Orange Right
                orb.targetX = (i === 0) ? width * 0.05 : width * 0.95;
                orb.targetY = height / 2;
            } else if (hasInteracted) {
                // Follow Cursor
                orb.targetX = mouseX;
                orb.targetY = mouseY;
            }

            const dx = orb.targetX - orb.x;
            const dy = orb.targetY - orb.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Magnetic attraction: pull is stronger when closer
            const magneticStrength = Math.max(0.1, 1 - (distance / 1000));
            // DRASTIC INCREASE: Split even faster (25x boost)
            const splitSpeedBoost = isInFeatures ? 25 : 1;
            const currentStiffness = orb.stiffness * (1 + magneticStrength * 10) * splitSpeedBoost;

            // Spring force calculation
            const ax = dx * currentStiffness;
            const ay = dy * currentStiffness;

            // Add acceleration/damping
            orb.vx += ax / orb.mass;
            orb.vy += ay / orb.mass;

            // Dynamic Damping: Increase damping (lower multiplier) during split to stop bouncing
            const currentDamping = isInFeatures ? 0.65 : orb.damping;
            orb.vx *= currentDamping;
            orb.vy *= currentDamping;

            // Update position
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Apply to specific orb variables
            const id = i + 1;
            root.style.setProperty(`--mouseX${id}`, `${orb.x}px`);
            root.style.setProperty(`--mouseY${id}`, `${orb.y}px`);

            // Sticky Stretch toward movement/direction
            const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
            const stretch = 1 + (speed * 0.015);
            const angle = Math.atan2(orb.vy, orb.vx) * (180 / Math.PI);

            root.style.setProperty(`--scale${id}`, stretch);
            root.style.setProperty(`--rotate${id}`, `${angle}deg`);
        });

        requestAnimationFrame(animate);
    }

    // Feature Card Spotlight Effect removed as requested

    console.log("Pulse Main JS Loaded"); // Verify execution

    animate();

    // Auto-merge after a short delay to show the initial split
    setTimeout(() => {
        hasInteracted = true;
    }, 300);

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
    });

    // --- NEW: Contact Clipboard Logic ---
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = contactBtn.getAttribute('data-email');

            navigator.clipboard.writeText(email).then(() => {
                const originalText = contactBtn.textContent;
                contactBtn.textContent = 'Email Copied!';
                contactBtn.classList.add('copied');

                setTimeout(() => {
                    contactBtn.textContent = originalText;
                    contactBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers or insecure contexts
                const textArea = document.createElement("textarea");
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    contactBtn.textContent = 'Email Copied!';
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            });
        });
    }
});