document.addEventListener('DOMContentLoaded', () => {
    const filter = document.querySelector('.filter');
    const overlay = filter.querySelector('.overlay');
    const filterButton = document.querySelector('#filter');

    filterButton.addEventListener('click', () => {
        filter.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        filter.classList.remove('active');
    });
});
