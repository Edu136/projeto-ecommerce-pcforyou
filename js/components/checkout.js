// js/components/checkout.js
import { formatCurrency } from '../utils/helpers.js';
import { apiListAddresses, apiAddAddress } from '../services/api.js';

// Renderiza o resumo do pedido
function renderOrderSummary(state, elements) {
  const { currentUser, cart, selectedAddressId } = state;
  const { orderSummary } = elements;
  const selectedAddress = (currentUser.addresses || []).find(addr => String(addr.id) === String(selectedAddressId));
  if (!selectedAddress) {
    orderSummary.innerHTML = '<p class="text-red-500">Erro: Endereco nao selecionado.</p>';
    return;
  }
  const itemsHTML = cart.map(item => `
    <div class="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
      <span>${item.name} (x${item.quantity})</span>
      <span class="font-semibold">${formatCurrency(item.price * item.quantity)}</span>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
    </div>`;
}

export function renderAddressList(user, elements) {
  const { addressList, noAddressMessage } = elements;
  addressList.innerHTML = '';
  const list = user.addresses || [];
  if (list.length === 0) {
    noAddressMessage.classList.remove('hidden');
    return;
  }
  noAddressMessage.classList.add('hidden');
  list.forEach(addr => {
    const card = document.createElement('div');
    card.className = 'p-4 border rounded-lg cursor-pointer hover:bg-gray-50';
    card.dataset.addressId = addr.id;
    card.innerHTML = `
      <p class="font-semibold">${addr.logradouro}, ${addr.numero}</p>
      <p class="text-sm text-gray-600">${addr.bairro} - ${addr.cidade}, ${addr.estado}</p>
      <p class="text-sm text-gray-600">${addr.cep}</p>`;
    addressList.appendChild(card);
  });
}

export function showNewAddressForm(elements) {
  elements.addressSelection.classList.add('hidden');
  elements.newAddressFormContainer.classList.remove('hidden');
}

function proceedToPayment(state, elements) {
  renderOrderSummary(state, elements);
  elements.addressStep.classList.add('hidden');
  elements.paymentSection.classList.remove('hidden');
}

export function initCheckout(state, elements, finalizeCallback) {
  // Mostrar formulario novo endereco
  elements.btnShowNewAddressForm.addEventListener('click', () => {
    showNewAddressForm(elements);
  });

  // Voltar para etapa endereco
  elements.btnBackToAddress.addEventListener('click', () => {
    elements.paymentSection.classList.add('hidden');
    elements.addressStep.classList.remove('hidden');
  });

  // Botao para recarregar enderecos do backend
  if (!document.getElementById('btn-refresh-addresses')) {
    const btn = document.createElement('button');
    btn.id = 'btn-refresh-addresses';
    btn.type = 'button';
    btn.className = 'mb-3 px-3 py-2 border rounded text-sm hover:bg-gray-50';
    btn.textContent = 'Recarregar enderecos';
    if (elements.addressSelection) elements.addressSelection.prepend(btn);
    btn.addEventListener('click', async () => {
      if (!state.currentUser?.id) { alert('Faca login para carregar seus enderecos.'); return; }
      try {
        const list = await apiListAddresses(state.currentUser.id);
        state.currentUser.addresses = Array.isArray(list) ? list : [];
        renderAddressList(state.currentUser, elements);
      } catch (_) {
        alert('Nao foi possivel recarregar os enderecos.');
      }
    });
  }

  // Selecionar endereco existente
  elements.addressList.addEventListener('click', (e) => {
    const card = e.target.closest('[data-address-id]');
    if (!card) return;
    elements.addressList.querySelectorAll('.selected-address').forEach(el => el.classList.remove('selected-address'));
    card.classList.add('selected-address');
    state.selectedAddressId = card.dataset.addressId;
    setTimeout(() => proceedToPayment(state, elements), 300);
  });

  // Salvar novo endereco (POST) e seguir
  elements.checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.checkoutForm);
    const dto = {
      cep: formData.get('cep'),
      logradouro: formData.get('address'),
      complemento: formData.get('complement'),
      numero: formData.get('number'),
      bairro: formData.get('bairro'),
      cidade: formData.get('cidade'),
      estado: formData.get('estado'),
      userId: state.currentUser?.id,
    };
    let created = { id: Date.now(), ...dto };
    const shouldSave = elements.checkoutForm.querySelector('#save-address').checked;
    if (shouldSave && state.currentUser?.id) {
      try {
        const res = await apiAddAddress(dto);
        if (res?.id) created = res;
      } catch (_) { /* fallback local */ }
      if (!Array.isArray(state.currentUser.addresses)) state.currentUser.addresses = [];
      state.currentUser.addresses.push(created);
    }
    state.selectedAddressId = created.id;
    proceedToPayment(state, elements);
  });

  // Finalizar compra
  elements.btnFinalizePurchase.addEventListener('click', () => {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!paymentMethod) { alert('Selecione uma forma de pagamento.'); return; }
    finalizeCallback();
  });
}

