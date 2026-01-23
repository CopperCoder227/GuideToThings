document.addEventListener('DOMContentLoaded', () => {
    // ── Sidebar toggle ────────────────────────────────────────
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');

    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            menuIcon.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
        });

        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
                menuIcon.textContent = '☰';
            });
        });
    }

    // ── Card loading only if container exists ─────────────────
    const container = document.getElementById('clubs-container');
    if (!container) return;

    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');

    // ── Decide which JSON file to load ────────────────────────
    let jsonPath = './data/clubs.json';
    let isClubbing = false;

    const pathname = window.location.pathname.toLowerCase();

    if (pathname.includes('hayley-fsport') || pathname.includes('fall')) {
        jsonPath = './data/fall.json';
    } else if (pathname.includes('hayley-wsport') || pathname.includes('winter')) {
        jsonPath = './data/winter.json';
    } else if (pathname.includes('hayley-ssport') || pathname.includes('spring')) {
        jsonPath = './data/spring.json';
    } else if (pathname.includes('clubs') || pathname.includes('clubbing')) {
        jsonPath = './data/clubbing.json';
        isClubbing = true;
    }

    // ── Fetch and render cards ───────────────────────────────
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${jsonPath} – status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (loading) loading.style.display = 'none';
            container.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p class="text-center lead">No items listed yet.</p>';
                return;
            }

            const roleLabel = isClubbing ? 'Teacher' : 'Coach';

            data.forEach(item => {
                const col = document.createElement('div');
                col.className = 'col';

                col.innerHTML = `
                    <div class="club-card">
                        <h3>${item.name || 'Unnamed'}</h3>
                        <p><strong>${roleLabel}:</strong> ${item.teacher || item.coach || 'TBD'}</p>
                        <p><strong>Description:</strong> ${item.description || 'No description available.'}</p>
                        <p><strong>Contact:</strong> ${item.contact || 'N/A'}</p>
                        <p><strong>Location:</strong> ${item.location || 'TBD'}</p>
                    </div>
                `;

                container.appendChild(col);
            });
        })
        .catch(err => {
            console.error('Error loading information:', err);
            if (loading) loading.style.display = 'none';
            if (errorEl) errorEl.style.display = 'block';
        });
});




// Array of carousel images
const carouselImages = [
    'imgs/main.webp',
    'imgs/sky.webp',
    'imgs/sport.webp',
    'imgs/frontsoot.webp',
    'imgs/football.webp',
    'imgs/botc.jpg',
];

const CAROUSEL_WIDTH = 600;
const CAROUSEL_HEIGHT = 400;

// Initialize carousel with images
function initCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');

    // Clear all existing carousel items
    const items = carouselInner.querySelectorAll('.carousel-item');
    items.forEach((item) => {
        item.remove();
    });

    // Add all images from the array
    carouselImages.forEach((imagePath, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        if (index === 0) carouselItem.classList.add('active');

        // Container for uniform sizing with letterboxing
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = CAROUSEL_HEIGHT + 'px';
        container.style.backgroundColor = 'white';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'MHS Logo';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.display = 'block';
        img.style.objectFit = 'contain';

        container.appendChild(img);
        carouselItem.appendChild(container);
        carouselInner.appendChild(carouselItem);
    });
}

// Initialize on page load - must run after the first DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});
