// js/components/ui.js

export function openCart(elements) {
    elements.cartSidebar.classList.remove('translate-x-full');
}

export function closeCart(elements) {
    elements.cartSidebar.classList.add('translate-x-full');
}

export function toggleMobileMenu(elements) {
    elements.mobileMenu.classList.toggle('hidden');
    const isExpanded = elements.btnMenu.getAttribute('aria-expanded') === 'true';
    elements.btnMenu.setAttribute('aria-expanded', !isExpanded);
}

export function showSection(sectionToShow) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    sectionToShow.classList.remove('hidden');
    window.scrollTo(0, 0);
}