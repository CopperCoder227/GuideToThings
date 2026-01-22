document.addEventListener('DOMContentLoaded', () => {
    // ── Sidebar toggle ────────────────────────────────────────
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');

    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            menuIcon.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
        });

        // Close sidebar when clicking links
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

    // Decide which JSON file to load
    let jsonPath = './data/clubs.json'; // fallback

    const pathname = window.location.pathname.toLowerCase();

    if (pathname.includes('hayley-fsport.html') || pathname.includes('fall')) {
        jsonPath = './data/fall.json';
    } else if (pathname.includes('hayley-wsport.html') || pathname.includes('winter')) {
        jsonPath = './data/winter.json';
    } else if (pathname.includes('hayley-ssport.html') || pathname.includes('spring')) {
        jsonPath = './data/spring.json';
    }

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
                container.innerHTML = '<p class="text-center lead">No fall sports listed yet.</p>';
                return;
            }

            data.forEach(item => {
                const col = document.createElement('div');
                col.className = 'col';

                col.innerHTML = `
                    <div class="club-card">
                        <h3>${item.name || 'Unnamed'}</h3>
                        <p><strong>Coach/Teacher:</strong> ${item.coach || item.teacher || 'TBD'}</p>
                        <p>${item.description || 'No description available.'}</p>
                        <p><strong>Contact:</strong> ${item.contact || 'N/A'}</p>
                        <p><strong>Location:</strong> ${item.location || 'TBD'}</p>
                    </div>
                `;

                container.appendChild(col);
            });
        })
        .catch(err => {
            console.error('Error loading fall sports:', err);
            if (loading) loading.style.display = 'none';
            if (errorEl) errorEl.style.display = 'block';
        });
});