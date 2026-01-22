// Array of carousel images
const carouselImages = [
    'imgs/athletic.jpg',
    'imgs/sky.webp',
    'imgs/sport.webp',
    'imgs/frontsoot.webp',
    'imgs/football.webp',
    'imgs/botc.jpg'
];

// Initialize carousel with images
function initCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');

    // Clear existing items except the first one
    const items = carouselInner.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        if (index > 0) item.remove();
    });

    // Add all images from the array
    carouselImages.forEach((imagePath, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        if (index === 0) carouselItem.classList.add('active');

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'MHS Logo';
        img.className = 'd-block w-100';

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCarousel);
