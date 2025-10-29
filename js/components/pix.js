// js/components/pix.js
import { QrCodePix } from "https://cdn.jsdelivr.net/npm/qrcode-pix@3.0.0/+esm";

const DEFAULT_PIX_KEY = "000201010211261510014BR.GOV.BCB.PIX0112800020101021126330014br.gov.bcb.pix0111154448696085204000053039865802BR5918RODRIGO L M DUARTE6013BELO HORIZONT62070503***6304037752040000530398654041.005802BR5925Rodrigo Leandro Mendes Du6014BELO HORIZONTE62150511PCFY-8002456304F123";
const DEFAULT_CITY = "BELO HORIZONTE";

export function initPix(state, elements) {
  // mostra/oculta controles PIX conforme seleção de pagamento
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const pixControls = document.getElementById('pix-controls');
  const applyPixVisibility = () => {
    const method = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (method === 'pix') {
      pixControls?.classList.remove('hidden');
    } else {
      pixControls?.classList.add('hidden');
    }
  };
  paymentRadios.forEach(r => r.addEventListener('change', applyPixVisibility));
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
    try {
      await navigator.clipboard.writeText(payloadArea?.value || '');
      alert('Copiado!');
    } catch {
      alert('Não foi possível copiar o código Pix.');
    }
  });

  btn?.addEventListener('click', async () => {
    const chaveInput = document.getElementById('pix-key-input');
    const chave = (chaveInput?.value || '').trim() || DEFAULT_PIX_KEY;
    const total = (state.cart || []).reduce((s, it) => s + (Number(it.price) * Number(it.quantity || 1)), 0);

    if (!Number.isFinite(total) || total <= 0) {
      alert('Adicione itens ao carrinho para gerar o Pix.');
      return;
    }

    const nome = (state.currentUser?.name || 'Cliente').toString().substring(0, 25);
    const cidade = DEFAULT_CITY;
    const txid = `PCFY${Date.now().toString().slice(-10)}`;

    try {
      const qrCodePix = QrCodePix({
        version: '01',
        key: chave,
        name: nome,
        city: cidade,
        transactionId: txid,
        value: Number(total.toFixed(2))
      });

      const payloadText = qrCodePix.payload();
      payloadArea.value = payloadText;

      const qrBase64 = await qrCodePix.base64();
      img.src = qrBase64.startsWith('data:image') ? qrBase64 : `data:image/png;base64,${qrBase64}`;
      openModal();
    } catch (error) {
      console.error('Erro ao gerar Pix', error);
      alert('Não foi possível gerar o QR Code Pix. Verifique os dados e tente novamente.');
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

