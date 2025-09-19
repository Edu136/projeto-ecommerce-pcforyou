// js/components/cart.js
import { formatCurrency } from '../utils/helpers.js';
import { openCart } from './ui.js';

export function updateCartUI(state, elements) {
    const { cart } = state;
    const { cartItems, cartTotal, cartCount, cartEmptyMessage, cartFooter, btnCheckout } = elements;

    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartEmptyMessage.classList.remove('hidden');
        cartFooter.classList.add('hidden');
    } else {
        cartEmptyMessage.classList.add('hidden');
        cartFooter.classList.remove('hidden');
        cartItems.innerHTML = cart.map(item => `
            <li class="flex items-center justify-between gap-4">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                <div class="flex-grow">
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-600">${formatCurrency(item.price)} x ${item.quantity}</p>
                </div>
                <button data-id="${item.id}" data-action="remove" class="remove-btn text-red-500 hover:text-red-700 font-bold">&times;</button>
            </li>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartTotal.textContent = formatCurrency(total);
    cartCount.textContent = totalItems;
    btnCheckout.disabled = cart.length === 0;
}

export function addToCart(productId, state, elements) {
    const productInCart = state.cart.find(item => item.id == productId);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        const product = state.products.find(p => p.id == productId);
        state.cart.push({ ...product, quantity: 1 });
    }
    updateCartUI(state, elements);
    openCart(elements);
}

export function removeFromCart(productId, state, elements) {
    state.cart = state.cart.filter(item => item.id != productId);
    updateCartUI(state, elements);
}