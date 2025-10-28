// js/components/pix.js
import { getApiBase } from '../services/api.js';

export function initPix(state, elements) {
  // mostra/oculta controles PIX conforme seleção de pagamento
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const pixControls = document.getElementById('pix-controls');
  const applyPixVisibility = () => {
    const method = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (method === 'pix') pixControls?.classList.remove('hidden');
    else pixControls?.classList.add('hidden');
  };
  paymentRadios.forEach(r => r.addEventListener('change', applyPixVisibility));
  // aplica estado inicial
  applyPixVisibility();

  const btn = document.getElementById('btn-generate-pix');
  const modal = document.getElementById('pix-modal');
  const close = document.getElementById('pix-modal-close');
  const img = document.getElementById('pix-qr-img');
  const payloadArea = document.getElementById('pix-payload');
  const copyBtn = document.getElementById('pix-copy');

  function openModal() { modal?.classList.remove('hidden'); }
  function closeModal() { modal?.classList.add('hidden'); }
  close?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  copyBtn?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(payloadArea?.value || ''); alert('Copiado!'); } catch {}
  });

  btn?.addEventListener('click', async () => {
    const chave = (document.getElementById('pix-key-input')?.value || '').trim();
    if (!chave) { alert('Informe a chave Pix.'); return; }

    const total = (state.cart || []).reduce((s, it) => s + (it.price * it.quantity), 0);
    const nome = (state.currentUser?.name || 'Cliente').toString().substring(0, 25);
    const cidade = 'BELO HORIZONTE';
    const txid = `PCFY${Date.now().toString().slice(-10)}`;

    const base = getApiBase();
    try {
      // payload textual
      const resPayload = await fetch(`${base}/pix/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, nome, cidade, valor: Number(total.toFixed(2)), txid })
      });
      const payloadText = await resPayload.text();
      if (resPayload.ok) payloadArea.value = payloadText; else payloadArea.value = 'Erro ao gerar payload';

      // imagem do QR
      const resQr = await fetch(`${base}/pix/qrcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, nome, cidade, valor: Number(total.toFixed(2)), txid })
      });
      if (!resQr.ok) throw new Error('Falha ao gerar QR');
      const blob = await resQr.blob();
      const url = URL.createObjectURL(blob);
      img.src = url;
      openModal();
    } catch (e) {
      alert('Não foi possível gerar o QR Pix. Verifique a API Base e o backend.');
    }
  });
}

// Auto init if global app available
try {
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      const boot = () => { try { if (window._pcfyApp) initPix(window._pcfyApp.state, window._pcfyApp.elements); } catch {} };
      setTimeout(boot, 0);
    });
  }
} catch {}
