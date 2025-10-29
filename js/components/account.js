// js/components/account.js
import { apiListAddresses, apiAddAddress, apiEditAddress, apiDeleteAddress } from '../services/api.js';
import { validaCep } from '../utils/helpers.js';
import { fetchAddressByCep } from '../services/cep.js';

export function openAccountModal(elements) { elements.accountModal.classList.remove('hidden'); }
export function closeAccountModal(elements) { elements.accountModal.classList.add('hidden'); resetAccountForms(elements); }

function resetAccountForms(elements){
  elements.addrForm.reset();
  elements.addrForm.dataset.mode = 'create';
  elements.addrForm.dataset.id = '';
  elements.addrSubmit.textContent = 'Adicionar Endereço';
}

export async function loadAddresses(state, elements) {
  if (!state.currentUser?.id) return;
  try {
    const list = await apiListAddresses(state.currentUser.id);
    state.currentUser.addresses = Array.isArray(list) ? list : [];
  } catch {}
}

export function renderAddresses(state, elements) {
  const container = elements.addrList;
  container.innerHTML = '';
  const list = state.currentUser?.addresses || [];
  if (!list.length) {
    container.innerHTML = '<p class="text-gray-500">Nenhum endereço cadastrado.</p>';
    return;
  }
  for (const addr of list) {
    const div = document.createElement('div');
    div.className = 'p-3 border rounded-md flex items-center justify-between gap-2';
    div.innerHTML = `
      <div>
        <div class="font-semibold">${addr.logradouro}, ${addr.numero}</div>
        <div class="text-sm text-gray-600">${addr.bairro} - ${addr.cidade}/${addr.estado} • CEP: ${addr.cep}</div>
        ${addr.complemento ? `<div class="text-sm text-gray-600">${addr.complemento}</div>` : ''}
      </div>
      <div class="flex gap-2">
        <button data-action="edit" data-id="${addr.id}" class="px-3 py-1 border rounded">Editar</button>
        <button data-action="delete" data-id="${addr.id}" class="px-3 py-1 border rounded text-red-600">Excluir</button>
      </div>`;
    container.appendChild(div);
  }
}

export function bindAccountEvents(state, elements) {
  // Abrir/fechar
  elements.accountClose.addEventListener('click', () => closeAccountModal(elements));
  elements.accountModal.addEventListener('click', (e) => { if (e.target === elements.accountModal) closeAccountModal(elements); });

  // Máscaras e auto-preenchimento
  // CEP: 00000-000
  elements.addrCep.addEventListener('input', () => {
    let v = elements.addrCep.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
    elements.addrCep.value = v;
  });
  elements.addrCep.addEventListener('blur', async () => {
    const cep = elements.addrCep.value;
    if (!validaCep(cep)) { alert('CEP inválido. Use o formato 00000-000'); return; }
    const data = await fetchAddressByCep(cep);
    if (data) {
      if (!elements.addrLog.value) elements.addrLog.value = data.logradouro || '';
      if (!elements.addrBairro.value) elements.addrBairro.value = data.bairro || '';
      if (!elements.addrCidade.value) elements.addrCidade.value = data.localidade || data.cidade || '';
      if (!elements.addrEstado.value) elements.addrEstado.value = (data.estado || data.uf || '').toString().toUpperCase();
    }
  });
  // UF: 2 letras maiúsculas
  elements.addrEstado.addEventListener('input', () => {
    elements.addrEstado.value = elements.addrEstado.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
  });

  // Submit add/editar
  elements.addrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentUser?.id) return alert('É necessário estar logado.');
    const form = elements.addrForm;
    const data = Object.fromEntries(new FormData(form).entries());
    if (!validaCep(data.cep)) { alert('CEP inválido. Corrija para continuar.'); return; }
    if (!data.estado || data.estado.length !== 2) { alert('Estado (UF) inválido. Use 2 letras, ex: MG'); return; }
    const addr = {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento || null,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado.toUpperCase(),
      userId: state.currentUser.id,
    };
    try {
      if (form.dataset.mode === 'edit' && form.dataset.id) {
        await apiEditAddress(form.dataset.id, addr);
      } else {
        await apiAddAddress(addr);
      }
      await loadAddresses(state, elements);
      renderAddresses(state, elements);
      resetAccountForms(elements);
      alert('Endereço salvo com sucesso.');
    } catch (err) {
      alert('Falha ao salvar endereço: ' + (err.message || 'Erro desconhecido'));
    }
  });

  // Editar/Excluir eventos na lista
  elements.addrList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete') {
      if (!confirm('Excluir este endereço?')) return;
      try {
        await apiDeleteAddress(id);
        await loadAddresses(state, elements);
        renderAddresses(state, elements);
      } catch (err) {
        alert('Falha ao excluir: ' + (err.message || 'Erro desconhecido'));
      }
    } else if (btn.dataset.action === 'edit') {
      const addr = (state.currentUser.addresses || []).find(a => String(a.id) === String(id));
      if (!addr) return;
      elements.addrForm.dataset.mode = 'edit';
      elements.addrForm.dataset.id = id;
      elements.addrSubmit.textContent = 'Salvar Alterações';
      elements.addrCep.value = addr.cep || '';
      elements.addrLog.value = addr.logradouro || '';
      elements.addrNum.value = addr.numero || '';
      elements.addrComp.value = addr.complemento || '';
      elements.addrBairro.value = addr.bairro || '';
      elements.addrCidade.value = addr.cidade || '';
      elements.addrEstado.value = addr.estado || '';
    }
  });


}

