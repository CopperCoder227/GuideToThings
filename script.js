// ── Global search data ───────────────────────────────────────
let allSearchData = [];

// ── Load and index all data for search ────────────────────────
async function loadSearchData() {
    const dataFiles = [
        { file: './data/fall.json', page: 'hayley-fsport.html', label: 'Fall Sports' },
        { file: './data/winter.json', page: 'hayley-wsport.html', label: 'Winter Sports' },
        { file: './data/spring.json', page: 'hayley-ssport.html', label: 'Spring Sports' },
        { file: './data/clubbing.json', page: 'clubs.html', label: 'Clubs' }
    ];

    for (const source of dataFiles) {
        try {
            const response = await fetch(source.file);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    data.forEach((item, index) => {
                        allSearchData.push({
                            name: item.name || 'Unnamed',
                            page: source.page,
                            label: source.label,
                            index: index,
                            searchText: `${item.name} ${item.description || ''} ${item.coach || ''} ${item.teacher || ''}`.toLowerCase()
                        });
                    });
                }
            }
        } catch (error) {
            console.error(`Error loading ${source.file}:`, error);
        }
    }
}

// ── Search functionality ──────────────────────────────────────
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length === 0) {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
            return;
        }

        const results = allSearchData.filter(item => item.searchText.includes(query));

        if (results.length === 0) {
            searchDropdown.innerHTML = '<div style="padding: 10px; text-align: center; color: #666;">No results found</div>';
            searchDropdown.style.display = 'block';
            return;
        }

        searchDropdown.innerHTML = results.map((result, idx) => `
            <div class="search-result" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;"
                 onmouseover="this.style.background='#f5f5f5'"
                 onmouseout="this.style.background='white'"
                 onclick="navigateToItem('${result.page}', ${result.index})">
                <strong>${result.name}</strong>
                <div style="font-size: 12px; color: #666;">${result.label}</div>
            </div>
        `).join('');

        searchDropdown.style.display = 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchDropdown.style.display = 'none';
        }
    });
}

// ── Navigate to item and scroll into view ──────────────────────
function navigateToItem(page, itemIndex) {
    // Store the target index for scroll after page load
    sessionStorage.setItem('scrollToItem', itemIndex);

    // Navigate to the page
    window.location.href = page;
}

// ── Scroll to item on page load ───────────────────────────────
function scrollToSearchResult() {
    const scrollToItem = sessionStorage.getItem('scrollToItem');
    if (!scrollToItem) return;

    sessionStorage.removeItem('scrollToItem');

    // Wait for cards to be rendered
    setTimeout(() => {
        const cards = document.querySelectorAll('.club-card');
        if (cards[scrollToItem]) {
            cards[scrollToItem].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card briefly
            cards[scrollToItem].style.transition = 'background-color 0.3s';
            cards[scrollToItem].style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                cards[scrollToItem].style.backgroundColor = '';
            }, 2000);
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    // ── Load search data ──────────────────────────────────────
    loadSearchData().then(() => {
        setupSearch();
    });

    // ── Scroll to search result if needed ──────────────────────
    scrollToSearchResult();

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
    let jsonPath = './data/clubbing.json';
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

                const descriptionHTML = isClubbing
                    ? `<p><strong>Description:</strong> ${item.description || 'No description available.'}</p>`
                    : '';

                col.innerHTML = `
                    <div class="club-card">
                        <h3>${item.name || 'Unnamed'}</h3>
                        <p><strong>${roleLabel}:</strong> ${item.teacher || item.coach || 'TBD'}</p>
                        ${descriptionHTML}
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


// ── Carousel ────────────────────────────────────────────────
const carouselImages = [
    'imgs/main.webp',
    'imgs/sky.webp',
    'imgs/sport.webp',
    'imgs/frontsoot.webp',
    'imgs/football.webp',
    'imgs/botc.jpg',
];

const CAROUSEL_HEIGHT = 400;

function initCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;

    carouselInner.querySelectorAll('.carousel-item').forEach(item => item.remove());

    carouselImages.forEach((imagePath, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        if (index === 0) carouselItem.classList.add('active');

        const container = document.createElement('div');
        container.style.height = CAROUSEL_HEIGHT + 'px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.backgroundColor = 'white';

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'MHS Logo';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';

        container.appendChild(img);
        carouselItem.appendChild(container);
        carouselInner.appendChild(carouselItem);
    });
}

document.addEventListener('DOMContentLoaded', initCarousel);
