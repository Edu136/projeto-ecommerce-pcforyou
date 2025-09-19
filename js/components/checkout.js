// js/components/checkout.js
import { formatCurrency } from '../utils/helpers.js';

// NOVA FUNÇÃO: Renderiza o resumo do pedido
function renderOrderSummary(state, elements) {
    const { currentUser, cart, selectedAddressId } = state;
    const { orderSummary } = elements;

    // 1. Encontrar o endereço selecionado
    const selectedAddress = currentUser.addresses.find(addr => addr.id == selectedAddressId);
    if (!selectedAddress) {
        orderSummary.innerHTML = `<p class="text-red-500">Erro: Endereço não selecionado.</p>`;
        return;
    }

    // 2. Montar a lista de itens do carrinho
    const itemsHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
            <span>${item.name} (x${item.quantity})</span>
            <span class="font-semibold">${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');

    // 3. Calcular o total
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 4. Montar o HTML final do resumo
    orderSummary.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-bold text-lg mb-2 border-b pb-2">Entregar em:</h4>
                <div class="text-gray-700">
                    <p class="font-semibold">${selectedAddress.logradouro}, ${selectedAddress.numero}</p>
                    <p>${selectedAddress.bairro} - ${selectedAddress.cidade}, ${selectedAddress.estado}</p>
                    <p>CEP: ${selectedAddress.cep}</p>
                </div>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-2 border-b pb-2">Resumo dos Itens:</h4>
                <div class="space-y-2 mb-4">${itemsHTML}</div>
                <div class="flex justify-between items-center text-xl font-bold text-blue-900 pt-2 border-t">
                    <span>Total:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    `;
}


export function renderAddressList(user, elements) {
    // ... (esta função permanece a mesma)
    const { addressList, noAddressMessage } = elements;
    addressList.innerHTML = '';
    if (!user.addresses || user.addresses.length === 0) {
        noAddressMessage.classList.remove('hidden');
        return;
    }
    noAddressMessage.classList.add('hidden');
    user.addresses.forEach(addr => {
        const addressCard = document.createElement('div');
        addressCard.className = 'p-4 border rounded-lg cursor-pointer hover:bg-gray-50';
        addressCard.dataset.addressId = addr.id;
        addressCard.innerHTML = `
            <p class="font-semibold">${addr.logradouro}, ${addr.numero}</p>
            <p class="text-sm text-gray-600">${addr.bairro} - ${addr.cidade}, ${addr.estado}</p>
            <p class="text-sm text-gray-600">${addr.cep}</p>
        `;
        addressList.appendChild(addressCard);
    });
}

export function showNewAddressForm(elements) {
    // ... (esta função permanece a mesma)
    elements.addressSelection.classList.add('hidden');
    elements.newAddressFormContainer.classList.remove('hidden');
}

// ATUALIZADO: A função agora precisa do 'state'
function proceedToPayment(state, elements) {
    renderOrderSummary(state, elements); // Preenche o resumo do pedido
    elements.addressStep.classList.add('hidden');
    elements.paymentSection.classList.remove('hidden');
}

export function initCheckout(state, elements, finalizeCallback) {
    // Botão para mostrar o formulário de novo endereço
    elements.btnShowNewAddressForm.addEventListener('click', () => {
        showNewAddressForm(elements);
    });
    
    // NOVO: Botão para voltar para a seleção de endereço
    elements.btnBackToAddress.addEventListener('click', () => {
        elements.paymentSection.classList.add('hidden');
        elements.addressStep.classList.remove('hidden');
    });

    // Evento para selecionar um endereço da lista
    elements.addressList.addEventListener('click', (e) => {
        const card = e.target.closest('[data-address-id]');
        if (card) {
            elements.addressList.querySelectorAll('.selected-address').forEach(el => el.classList.remove('selected-address'));
            card.classList.add('selected-address');

            // ATUALIZADO: Guarda o ID do endereço selecionado no state
            state.selectedAddressId = card.dataset.addressId;

            setTimeout(() => {
                // ATUALIZADO: Passa o 'state' para a função
                proceedToPayment(state, elements);
            }, 300);
        }
    });

    // Evento para submeter um novo endereço
    elements.checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(elements.checkoutForm);
        const newAddress = {
            id: Date.now(),
            // ... (resto dos campos do endereço)
            cep: formData.get('cep'),
            logradouro: formData.get('address'),
            numero: formData.get('number'),
            complemento: formData.get('complement'),
            bairro: formData.get('bairro'),
            cidade: formData.get('cidade'),
            estado: formData.get('estado'),
        };

        if (elements.checkoutForm.querySelector('#save-address').checked) {
            state.currentUser.addresses.push(newAddress);
        }

        // ATUALIZADO: Guarda o ID do novo endereço no state
        state.selectedAddressId = newAddress.id;

        // ATUALIZADO: Passa o 'state' para a função
        proceedToPayment(state, elements);
    });

    // Evento do botão para finalizar a compra
    elements.btnFinalizePurchase.addEventListener('click', () => {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod) {
            alert("Por favor, selecione uma forma de pagamento.");
            return;
        }
        console.log("Pedido finalizado com o método:", paymentMethod.value);
        finalizeCallback();
    });
}