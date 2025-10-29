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

export function showSection(sectionToShow, options = {}) {
    // garante que o scroll geral volte a funcionar caso algum modal tenha bloqueado
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.body.classList.remove('overflow-hidden');
    document.documentElement.classList.remove('overflow-hidden');

    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    sectionToShow.classList.remove('hidden');
    const extras = Array.isArray(options.alsoShow) ? options.alsoShow : [];
    extras.forEach(sec => {
        if (sec && typeof sec.classList?.remove === 'function') {
            sec.classList.remove('hidden');
        }
    });
    window.scrollTo(0, 0);
}
