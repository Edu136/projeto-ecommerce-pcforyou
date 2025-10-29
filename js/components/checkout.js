// js/components/checkout.js
import { formatCurrency } from '../utils/helpers.js';
import { apiListAddresses, apiAddAddress, criarPedidoNoBanco } from '../services/api.js';

// Renderiza o resumo do pedido
function renderOrderSummary(state, elements) {
  const { currentUser, cart } = state;
  const { orderSummary } = elements;
  let selectedAddress = (currentUser.addresses || []).find(addr => String(addr.id) === String(state.selectedAddressId));
  // fallback: seleciona o primeiro endereÃ§o caso nenhum tenha sido escolhido
  if (!selectedAddress && (currentUser.addresses || []).length > 0) {
    state.selectedAddressId = currentUser.addresses[0].id;
    selectedAddress = currentUser.addresses[0];
  }
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

export function renderAddressList(user, elements, selectedId = null) {
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
    const isSelected = String(addr.id) === String(selectedId);
    card.className = 'p-4 border rounded-lg cursor-pointer hover:bg-gray-50' + (isSelected ? ' selected-address' : '');
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
  // marca salvar endereÃ§o como padrÃ£o, se existir o checkbox
  try { const cb = elements.checkoutForm?.querySelector('#save-address'); if (cb) cb.checked = true; } catch {}
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
        renderAddressList(state.currentUser, elements, state.selectedAddressId);
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
    if (!Array.isArray(state.currentUser.addresses)) state.currentUser.addresses = [];
    if (shouldSave && state.currentUser?.id) {
      try {
        const res = await apiAddAddress(dto);
        if (res?.id) created = res;
      } catch (_) { /* fallback local */ }
    }
    const existingIndex = state.currentUser.addresses.findIndex(addr => String(addr.id) === String(created.id));
    if (existingIndex >= 0) {
      state.currentUser.addresses[existingIndex] = created;
    } else {
      state.currentUser.addresses.push(created);
    }
    state.selectedAddressId = created.id;
    try { renderAddressList(state.currentUser, elements, state.selectedAddressId); } catch {}
    proceedToPayment(state, elements);
  });

  // Finalizar compra
  // Finalizar compra
elements.btnFinalizePurchase.addEventListener('click', async () => {
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
  if (!paymentMethod) {
    alert('Selecione uma forma de pagamento.');
    return;
  }

  // --- ETAPA 1: VALIDAR O CLIENTE ---
  
  // (EXEMPLO: Pegando o ID do usuário do localStorage)
  // Você DEVE ter salvo o ID do usuário no localStorage após o login.
  const userId = localStorage.getItem('userId'); 
  
  if (!userId) {
    alert('Você não está logado. Faça o login para continuar.');
    return; // Para o processo
  }

  // Validar carrinho
  const cart = state.cart || [];
  if (cart.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  // --- ETAPA 2: SALVAR O PEDIDO NO BANCO ---
  
  // Chama a função que envia para o backend.
  // O backend vai validar o estoque e salvar.
  const pedidoCriado = await criarPedidoNoBanco(userId, cart);

  if (pedidoCriado === null) {
    // A função 'criarPedidoNoBanco' já exibiu o alerta de erro (ex: "Fora de estoque")
    return; // Para a execução, o pedido falhou.
  }

  // ----- SUCESSO! O Pedido (ID: pedidoCriado.id) FOI CRIADO NO BANCO -----
  // O estoque já foi atualizado pelo backend.

  // --- ETAPA 3: PROCESSAR O PAGAMENTO (INTERFACE) ---
  
  if (paymentMethod.value === 'pix') {
    console.log("Pedido salvo no banco. Gerando PIX...");

    // (Aqui você usa a sua gambiarra do PIX, pois o pedido já está salvo)
    try {
      const payloadText = "00020126360014BR.GOV.BCB.PIX0115seuemail@exemplo.com0209Pagamento520400005303986540525.005802BR5909NOME DO RECEBEDOR600D BELO HORIZONTE62070503***6304A13B";
      
      const qrBase64 = "https://www.cjf.jus.br/cjf/corregedoria-da-justica-federal/turma-nacional-de-uniformizacao/QRCODE.png/@@images/5b045579-9526-478a-9165-25a590ebab68.png";

      // Atualiza campo de texto
      const payloadArea = document.getElementById('pix-payload');
      if (payloadArea) payloadArea.value = payloadText;

      // Atualiza imagem do QR Code
      const img = document.getElementById('pix-qr-img');
      if (img) img.src = qrBase64;

      // Exibe modal Pix
      const modal = document.getElementById('pix-modal');
      if (modal) modal.classList.remove('hidden');

      alert('Pedido recebido! (ID: ' + pedidoCriado.id + '). Aguardando pagamento do PIX.');
      
      // Limpe o carrinho do frontend (pois o pedido foi criado)
      // state.cart = [];
      // updateCartUI(); // (chame sua função de atualizar o carrinho na tela)

      return; // Espera o pagamento
      
      } catch (e) {
        console.error('Erro ao gerar QR Code PIX:', e);
        alert('O pedido foi salvo, mas falhamos ao gerar o QR Code. Tente novamente.');
        return;
      }
    }

  // Se for outro método de pagamento (Boleto, Cartão...)
  // O pedido JÁ FOI SALVO.
  alert('Pedido finalizado com sucesso! (ID: ' + pedidoCriado.id + ')');
  
  // Limpe o carrinho do frontend
  // state.cart = [];
  // updateCartUI(); // (chame sua função de atualizar o carrinho na tela)
  
  // Seu finalizeCallback() original não é mais necessário aqui, 
  // pois já fizemos tudo.
  // finalizeCallback(); 
});




  // Confirma pagamento Pix no modal e finaliza compra
  const pixConfirmBtn = document.getElementById('pix-confirm');
  const pixModal = document.getElementById('pix-modal');
  pixConfirmBtn && pixConfirmBtn.addEventListener('click', () => {
    // fecha modal e conclui fluxo normal
    try { pixModal?.classList.add('hidden'); } catch {}
    finalizeCallback();
  });
}



