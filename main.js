/**
 * Pulse Interactive Landing Page
 * Creative Multi-Orb Spring Physics System + Navbar Interaction
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pulse: Creative Glow & Navbar Initialized');

    const navbar = document.querySelector('.navbar');

    // Get direct references to orb DOM elements
    const orbEl1 = document.querySelector('.orb-1');
    const orbEl2 = document.querySelector('.orb-2');
    const orbElements = [orbEl1, orbEl2];

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
            stiffness: 0.02,
            damping: 0.82,
            mass: 12.0
        },
        {
            x: startX2,
            y: startY2,
            targetX: startX2,
            targetY: startY2,
            vx: 0,
            vy: 0,
            stiffness: 0.015,
            damping: 0.85,
            mass: 15.0
        }
    ];

    // --- Navbar Scroll Logic ---
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
    }, { threshold: 0.2 });

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
            const splitSpeedBoost = isInFeatures ? 25 : 1;
            const currentStiffness = orb.stiffness * (1 + magneticStrength * 10) * splitSpeedBoost;

            // Spring force calculation
            const ax = dx * currentStiffness;
            const ay = dy * currentStiffness;

            // Add acceleration/damping
            orb.vx += ax / orb.mass;
            orb.vy += ay / orb.mass;

            // Dynamic Damping
            const currentDamping = isInFeatures ? 0.65 : orb.damping;
            orb.vx *= currentDamping;
            orb.vy *= currentDamping;

            // Update position
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Sticky Stretch toward movement/direction
            const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
            const stretch = 1 + (speed * 0.015);
            const angle = Math.atan2(orb.vy, orb.vx) * (180 / Math.PI);

            // Apply directly to DOM element inline styles (reliable across all browsers)
            const el = orbElements[i];
            if (el) {
                el.style.left = orb.x + 'px';
                el.style.top = orb.y + 'px';
                el.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg) scaleX(' + stretch + ')';
            }
        });

        requestAnimationFrame(animate);
    }

    console.log("Pulse Main JS Loaded");

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

    // --- Contact Clipboard Logic ---
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