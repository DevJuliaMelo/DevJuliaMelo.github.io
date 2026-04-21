// ===========================
// Particle Network Animation
// ===========================

const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };

const CONFIG = {
    count: 90,
    maxDist: 160,
    speed: 0.45,
    mouseRadius: 160,
    color: '59, 130, 246',
    mouseColor: '139, 92, 246',
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * CONFIG.speed;
        this.vy = (Math.random() - 0.5) * CONFIG.speed;
        this.r = Math.random() * 1.8 + 0.8;
        this.alpha = Math.random() * 0.4 + 0.25;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;

        // Mouse repulsion
        if (mouse.x !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius) {
                const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * 0.025;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }

        // Speed cap
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = CONFIG.speed * 2.5;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CONFIG.color}, ${this.alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
}

function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];

        // Particle-to-particle lines
        for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.maxDist) {
                const alpha = (1 - dist / CONFIG.maxDist) * 0.25;
                ctx.beginPath();
                ctx.moveTo(pi.x, pi.y);
                ctx.lineTo(pj.x, pj.y);
                ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        // Particle-to-mouse lines
        if (mouse.x !== null) {
            const dx = pi.x - mouse.x;
            const dy = pi.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius) {
                const alpha = (1 - dist / CONFIG.mouseRadius) * 0.5;
                ctx.beginPath();
                ctx.moveTo(pi.x, pi.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${CONFIG.mouseColor}, ${alpha})`;
                ctx.lineWidth = 0.75;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
}

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

window.addEventListener('resize', () => { resize(); initParticles(); });

resize();
initParticles();
animate();

// ===========================
// Navbar: scroll + mobile menu
// ===========================

const navbar  = document.getElementById('navbar');
const toggle  = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightActiveSection();
});

toggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    toggle.querySelector('i').classList.toggle('fa-bars');
    toggle.querySelector('i').classList.toggle('fa-times');
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.querySelector('i').classList.add('fa-bars');
        toggle.querySelector('i').classList.remove('fa-times');
    });
});

// ===========================
// Active nav link on scroll
// ===========================

const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

function highlightActiveSection() {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

// ===========================
// Scroll Animations (Intersection Observer)
// ===========================

const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
            // Stagger delay for grid siblings
            const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
            let delay = 0;
            siblings.forEach((sib, i) => { if (sib === entry.target) delay = i * 120; });
            setTimeout(() => entry.target.classList.add('visible'), delay);
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

fadeEls.forEach(el => fadeObserver.observe(el));

// ===========================
// Skill bars animation on scroll
// ===========================

const skillCards = document.querySelectorAll('.skill-card');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((fill, i) => {
                const width = fill.getAttribute('data-width');
                setTimeout(() => { fill.style.width = width + '%'; }, i * 160);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.35 });

skillCards.forEach(card => skillObserver.observe(card));
