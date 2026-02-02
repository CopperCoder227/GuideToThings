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
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');

    // ── Global search (indexes all data files for suggestions) ──
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    let searchIndex = [];

    function fetchAllDataFiles() {
        const sources = [
            { file: './data/clubbing.JSON', page: 'clubs.html' },
            { file: './data/fall.JSON', page: 'hayley-fsport.html' },
            { file: './data/winter.JSON', page: 'hayley-wsport.html' },
            { file: './data/spring.JSON', page: 'hayley-ssport.html' },
        ];

        return Promise.all(sources.map(s =>
            fetch(s.file)
                .then(r => r.ok ? r.json() : [])
                .then(arr => (Array.isArray(arr) ? arr.map(it => ({ name: String(it.name || '').trim(), page: s.page, data: it })) : []))
                .catch(() => [])
        )).then(results => {
            searchIndex = results.flat().filter(e => e.name);
        });
    }

    function getTopMatches(q, limit = 3) {
        if (!q) return [];
        q = q.toLowerCase();
        const scored = searchIndex.map(e => {
            const name = e.name;
            const nl = name.toLowerCase();
            let score = 0;
            if (nl.startsWith(q)) score += 100;
            if (nl.includes(q)) score += 1;
            return { ...e, score };
        }).filter(e => e.score > 0)
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        return scored.slice(0, limit);
    }

    function showSuggestions(matches) {
        if (!searchDropdown) return;
        if (!matches.length) {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
            return;
        }

        searchDropdown.innerHTML = matches.map(m => `<div class="px-2 py-1 suggestion" style="cursor:pointer">${m.name}</div>`).join('');
        searchDropdown.style.display = 'block';

        searchDropdown.querySelectorAll('.suggestion').forEach((el, idx) => {
            el.addEventListener('click', () => {
                const name = matches[idx].name;
                searchInput.value = name;
                searchDropdown.style.display = 'none';

                // If we're on a page with cards, filter there; otherwise navigate to the relevant page
                if (container) {
                    filterCards(name.toLowerCase());
                } else {
                    window.location.href = matches[idx].page + '?q=' + encodeURIComponent(name);
                }
            });
        });
    }

    function filterCards(query) {
        if (!container) return;
        const cols = container.querySelectorAll('.col');
        const q = String(query || '').toLowerCase();
        cols.forEach(col => {
            const titleEl = col.querySelector('.club-card h3');
            const text = (titleEl ? titleEl.textContent : col.textContent || '').toLowerCase();
            col.style.display = q ? (text.includes(q) ? '' : 'none') : '';
        });
    }

    // Highlight a card by exact name (case-insensitive), scroll into view, then remove highlight after a short delay
    function highlightCardByName(name) {
        if (!container || !name) return;
        const q = String(name).trim().toLowerCase();
        if (!q) return;
        const titleEls = Array.from(container.querySelectorAll('.club-card h3'));
        const match = titleEls.find(h => h.textContent.trim().toLowerCase() === q);
        if (!match) return;
        const card = match.closest('.club-card');
        if (!card) return;

        // Apply highlight class and smooth scroll
        card.classList.add('search-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove highlight after 3 seconds
        setTimeout(() => {
            card.classList.remove('search-highlight');
        }, 3000);
    }

    // wire up search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = String(e.target.value || '').trim();
            if (!q) {
                showSuggestions([]);
                return;
            }

            const matches = getTopMatches(q);
            showSuggestions(matches);

            // DO NOT filter or hide cards while typing — keep the list unchanged
        });

        // hide dropdown on outside click
        document.addEventListener('click', (e) => {
            if (searchDropdown && !e.target.closest('.search-container')) {
                searchDropdown.style.display = 'none';
            }
        });

        // handle Enter to accept first suggestion — fallback to top match if none shown
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = (searchDropdown && searchDropdown.querySelector('.suggestion')) || null;
                if (first) {
                    first.click();
                    e.preventDefault();
                    return;
                }

                // no dropdown suggestion selected — navigate/highlight top match if available
                const q = String(searchInput.value || '').trim();
                if (q) {
                    const top = getTopMatches(q, 1)[0];
                    if (top) {
                        const currentPath = window.location.pathname.toLowerCase();
                        if (currentPath.includes(top.page) || (top.page === 'clubs.html' && currentPath.includes('clubs'))) {
                            // same page — highlight
                            highlightCardByName(top.name);
                        } else {
                            // navigate to the correct page and highlight there
                            window.location.href = top.page + '?q=' + encodeURIComponent(top.name);
                        }
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // fetch the data index for suggestions (do it regardless of whether this page shows cards)
    fetchAllDataFiles().then(() => {
        // If URL has ?q=... prefill and apply filter or navigate
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
            if (container) filterCards(q.toLowerCase());
        }
    });

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

                const descriptionHTML = isClubbing
                    ? `<p><strong>Description:</strong> ${item.description || 'No description available.'}</p>`
                    : '';

                const imageHTML = item.image
                    ? `<img src="${item.image}" alt="${item.name || 'Unnamed'}" class="club-image">`
                    : '';

                col.innerHTML = `
                    <div class="club-card">
                        ${imageHTML}
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
