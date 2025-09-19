// js/components/product.js
import { formatCurrency } from '../utils/helpers.js';

export function renderProducts(productsToRender, elements) {
    if (productsToRender.length === 0) {
        elements.productList.innerHTML = '<p class="col-span-full text-center text-gray-500">Nenhum produto encontrado.</p>';
        return;
    }
    const productsHTML = productsToRender.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 w min-h-[380px] flex flex-col">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-blue-900">${product.name}</h3>
                <p class="text-gray-600 mt-2">${formatCurrency(product.price)}</p>
                <div class="mt-auto pt-4">
                    <button data-id="${product.id}" data-action="details" class="details-btn w-full bg-blue-100 text-blue-800 font-semibold py-2 rounded hover:bg-blue-200 transition">
                        Ver Detalhes
                    </button>
                    <button class="add-to-cart-btn mt-2 w-full bg-green-900 text-white font-semibold py-2 rounded hover:bg-green-600 transition" data-id="${product.id}" data-action="add">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    elements.productList.innerHTML = productsHTML;
}

export function applyFiltersAndSort(state, elements) {
    let filteredProducts = [...state.products];
    const searchTerm = elements.searchInput.value.toLowerCase();
    const category = elements.categoryFilter.value;
    const sortBy = elements.sortFilter.value;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'best-sellers':
            filteredProducts.sort((a, b) => b.bestSeller - a.bestSeller);
            break;
    }
    renderProducts(filteredProducts, elements);
}

export function openProductModal(productId, state, elements) {
    const product = state.products.find(p => p.id == productId);
    elements.modalTitle.textContent = product.name;
    elements.modalImage.src = product.image;
    elements.modalImage.alt = product.name;
    elements.modalDesc.textContent = product.description;
    elements.modalPrice.textContent = formatCurrency(product.price);
    elements.modalAddCart.dataset.id = product.id;
    elements.productModal.classList.remove('hidden');
}

export function closeProductModal(elements) {
    elements.productModal.classList.add('hidden');
}