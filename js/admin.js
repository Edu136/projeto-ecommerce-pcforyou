(() => {
  const qs = (sel) => document.querySelector(sel);
  const qv = (sel) => qs(sel).value;
  const out = (sel, val) => (qs(sel).textContent = val);
  const showJson = (sel, obj) => (qs(sel).textContent = safeJson(obj));
  function imageCount(p){
    if (Array.isArray(p?.imagens)) return p.imagens.length;
    const keys = ['quantidadeImagens','qtdImagens','imagensCount','totalImagens','imagesCount'];
    for (const k of keys){ if (typeof p?.[k] === 'number') return p[k]; }
    return typeof p?.imagensQuantidade === 'number' ? p.imagensQuantidade : '-';
  }
  const formatProdutoLine = (p) => {
    const id = p?.id ?? '-';
    const nome = p?.nome ?? p?.name ?? '-';
    const preco = (p?.preco ?? p?.preço ?? p?.price ?? '-');
    const descricao = p?.descricao ?? p?.descrição ?? p?.description ?? '-';
    const imgs = imageCount(p);
    return `id: ${id}  nome: ${nome}  preço: ${preco}  descrição: ${descricao}  imagens: ${imgs}`;
  };
  const formatProdutosList = (arr) => Array.isArray(arr) && arr.length
    ? arr.map(formatProdutoLine).join("\n")
    : 'Nenhum produto encontrado.';

  const LS_KEY = 'pcfy_api_base';
  const defaultBase = 'http://localhost:8080';

  function getBase() {
    return qv('#api-base') || defaultBase;
  }

  const STATUS_SELECTORS = [
    '#create-status',
    '#edit-status',
    '#delete-status',
    '#upl-status',
    '#uplm-status',
    '#img-delete-status',
  ];

  // keep last list cached for re-render with filters
  let lastProdutos = [];

  const statusTimers = {};

  function clearStatus(sel) {
    const el = qs(sel);
    if (!el) return;
    el.textContent = '';
    if (statusTimers[sel]) {
      clearTimeout(statusTimers[sel]);
      delete statusTimers[sel];
    }
  }

  function clearAllStatuses(exceptSel) {
    for (const s of STATUS_SELECTORS) {
      if (exceptSel && s === exceptSel) continue;
      clearStatus(s);
    }
  }

  function setStatus(sel, msg, ok = true) {
    const el = qs(sel);
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#22c55e' : '#ef4444';
    if (statusTimers[sel]) clearTimeout(statusTimers[sel]);
    if (msg) {
      statusTimers[sel] = setTimeout(() => {
        const node = qs(sel);
        if (node && node.textContent === msg) node.textContent = '';
        delete statusTimers[sel];
      }, 10000); // 10s auto-clear
    }
  }

  // date helpers
  function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function parseMaybeDate(val) {
    if (!val) return null;
    if (typeof val === 'number') return new Date(val);
    if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  function produtoCreatedAt(p) {
    const candidates = [
      // comuns em Java/Spring e DTOs
      'createdAt','created_at','creationDate','creation_date',
      'dataCriacao','data_criacao','criadoEm','criado_em',
      'dataCadastro','data_cadastro','dtCriacao','dt_criacao',
      'insertedAt','inseridoEm',
      // extras defensivos
      'created','createdon','created_on','createdDate','created_date',
      'data','date'
    ];
    for (const k of candidates) {
      const d = parseMaybeDate(p?.[k]);
      if (d) return d;
    }
    return null;
  }

  function applyDateFilter(arr) {
    const onlyToday = qs('#only-today')?.checked;
    const dateInput = qs('#date-filter');
    let baseDate = null;
    if (dateInput && dateInput.value) {
      const d = new Date(dateInput.value + 'T00:00:00');
      if (!isNaN(d.getTime())) baseDate = d;
    }
    if (!baseDate) baseDate = new Date();
    if (!onlyToday && !dateInput?.value) return arr; // sem filtro

    let recognized = 0;
    const filtered = arr.filter((p) => {
      const d = produtoCreatedAt(p);
      if (!d) return false;
      recognized++;
      return isSameDay(d, baseDate);
    });

    // Se nenhum item possui um campo de data reconhecido, não esconda tudo.
    if (recognized === 0) return arr;
    return filtered;
  }

  function renderProdutos(arr) {
    lastProdutos = Array.isArray(arr) ? arr : [];
    const filtered = applyDateFilter(lastProdutos);
    out('#produtos-output', formatProdutosList(filtered));
  }

  function safeJson(data) {
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }

  function toNumber(val) {
    if (val === '' || val === null || val === undefined) return NaN;
    return Number(val);
  }

  // init API base
  const saved = localStorage.getItem(LS_KEY) || '';
  qs('#api-base').value = saved || defaultBase;
  // set default date filter to today
  const dateInput = qs('#date-filter');
  if (dateInput) dateInput.value = todayStr();
  qs('#save-api').addEventListener('click', () => {
    clearAllStatuses('#create-status');
    localStorage.setItem(LS_KEY, getBase());
    setStatus('#create-status', 'API base salva');
  });

  // re-render list when filter changes
  qs('#only-today')?.addEventListener('change', () => renderProdutos(lastProdutos));
  qs('#date-filter')?.addEventListener('change', () => renderProdutos(lastProdutos));

  // Listar produtos
  qs('#btn-load-produtos').addEventListener('click', async () => {
    clearAllStatuses();
    const url = `${getBase()}/produtos`;
    out('#produtos-output', 'Carregando...');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      renderProdutos(data);
    } catch (e) {
      out('#produtos-output', 'Erro: ' + e.message);
    }
  });

  // Filtrar por status
  qs('#btn-filter-status').addEventListener('click', async () => {
    clearAllStatuses();
    const status = qv('#status-filter');
    if (!status) return out('#produtos-output', 'Informe um status.');
    const url = `${getBase()}/produtos/${encodeURIComponent(status)}`;
    out('#produtos-output', 'Carregando...');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      renderProdutos(data);
    } catch (e) {
      out('#produtos-output', 'Erro: ' + e.message);
    }
  });

  // Criar produto (ProdutoCreateDTO)
  qs('#form-create').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearAllStatuses('#create-status');
    const nome = qv('#create-nome').trim();
    const descricao = qv('#create-descricao').trim();
    const preco = toNumber(qv('#create-preco'));
    const quantidade = toNumber(qv('#create-quantidade'));

    if (!nome || !descricao || !(preco > 0) || !(quantidade > 0)) {
      return setStatus('#create-status', 'Preencha todos os campos válidos', false);
    }

    const body = { nome, descricao, preco, quantidade , categoriaId: toNumber(qv('#create-categoria'))};
    setStatus('#create-status', 'Enviando...');
    try {
      const res = await fetch(`${getBase()}/produtos/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setStatus('#create-status', 'Criado com sucesso');
      // opcional: recarregar lista automaticamente
      try {
        const r2 = await fetch(`${getBase()}/produtos`);
        if (r2.ok) {
          const d2 = await r2.json();
          renderProdutos(d2);
        }
      } catch {}
      // notifica outras abas/front-end para recarregar a lista ATIVO
      try { new BroadcastChannel('pcfy-products').postMessage({ type: 'changed', at: Date.now() }); } catch {}
      try { localStorage.setItem('pcfy_products_changed', String(Date.now())); } catch {}
    } catch (e) {
      setStatus('#create-status', 'Erro: ' + e.message, false);
    }
  });

  // Editar produto (assumindo campos iguais ao create)
  qs('#form-edit').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearAllStatuses('#edit-status');
    const id = qv('#edit-id');
    const nome = qv('#edit-nome').trim();
    const descricao = qv('#edit-descricao').trim();
    const preco = toNumber(qv('#edit-preco'));
    const quantidade = toNumber(qv('#edit-quantidade'));
    if (!id || !nome || !descricao || !(preco > 0) || !(quantidade > 0)) {
      return setStatus('#edit-status', 'Preencha todos os campos válidos', false);
    }

    const body = { nome, descricao, preco, quantidade, categoriaId: toNumber(qv('#edit-categoria')) };
    setStatus('#edit-status', 'Enviando...');
    try {
      const res = await fetch(`${getBase()}/produtos/editar/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setStatus('#edit-status', 'Editado com sucesso');
      // opcional: recarregar lista automaticamente
      try {
        const r2 = await fetch(`${getBase()}/produtos`);
        if (r2.ok) {
          const d2 = await r2.json();
          renderProdutos(d2);
        }
      } catch {}
      try { new BroadcastChannel('pcfy-products').postMessage({ type: 'changed', at: Date.now() }); } catch {}
      try { localStorage.setItem('pcfy_products_changed', String(Date.now())); } catch {}
    } catch (e) {
      setStatus('#edit-status', 'Erro: ' + e.message, false);
    }
  });


  // Upload única
  qs('#form-upload-unique').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearAllStatuses('#upl-status');
    const idProduto = qv('#upl-id-produto');
    const nomeDoArquivo = qv('#upl-nome-arquivo');
    const file = qs('#upl-file').files[0];
    if (!idProduto || !file) return setStatus('#upl-status', 'Preencha os campos', false);

    const form = new FormData();
    if (!nomeDoArquivo) { return setStatus('#upl-status', 'Informe o nome do arquivo', false); }
    form.append('idProduto', idProduto);
    form.append('nomeDoArquivo', nomeDoArquivo);
    form.append('file', file);

    setStatus('#upl-status', 'Enviando...');
    try {
      const res = await fetch(`${getBase()}/images/add`, { method: 'POST', body: form });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
      setStatus('#upl-status', text || 'OK');
    } catch (e) {
      setStatus('#upl-status', 'Erro: ' + e.message, false);
    }
  });

  // Upload múltiplas
  qs('#form-upload-multi').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearAllStatuses('#uplm-status');
    const idProduto = qv('#uplm-id-produto');
    const files = qs('#uplm-files').files;
    if (!idProduto || !files?.length) return setStatus('#uplm-status', 'Preencha os campos', false);

    const form = new FormData();
    form.append('idProduto', idProduto);
    for (const f of files) form.append('files', f);

    setStatus('#uplm-status', 'Enviando...');
    try {
      const res = await fetch(`${getBase()}/images/add/multiple`, { method: 'POST', body: form });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
      setStatus('#uplm-status', text || 'OK');
    } catch (e) {
      setStatus('#uplm-status', 'Erro: ' + e.message, false);
    }
  });

  // Excluir imagem
  qs('#btn-img-excluir').addEventListener('click', async () => {
    clearAllStatuses('#img-delete-status');
    const id = qv('#img-delete-id');
    if (!id) return setStatus('#img-delete-status', 'Informe o ID', false);
    setStatus('#img-delete-status', 'Excluindo...');
    try {
      const res = await fetch(`${getBase()}/images/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${res.statusText}`);
      setStatus('#img-delete-status', 'Imagem excluída');
    } catch (e) {
      setStatus('#img-delete-status', 'Erro: ' + e.message, false);
    }
  });

  async function listaCategorias(){

    const url = `http://localhost:8080/categorias/all`;

    try {
      const response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar categorias');
      }
      return response.json();

    } catch (error) {
      console.error(`Erro na listaCategorias (GET ${url}):`, error);  
      if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de rede ou CORS. Verifique o console e o backend.');
      }
      throw error;
    }
  }

  async function populaDropdownCategorias() {
    // Pega o elemento <select>
    const selectElement = document.getElementById('create-categoria');
    const selectElementEdit = document.getElementById('edit-categoria');
    
    try {
      // 1. Chama a API
      const categorias = await listaCategorias(); 

      // 2. Faz um loop e cria os <option>
      for (const categoria of categorias) {
        // 'categoria' aqui é o seu CategoriaResponseDTO (ex: { id: 1, nomeCategoria: "Placas de Vídeo" })
        
        const option = document.createElement('option');
        option.value = categoria.id; // O valor será o ID (ex: 1)
        option.textContent = categoria.nomeCategoria; // O texto será o Nome (ex: "Placas de Vídeo")
        
        selectElement.appendChild(option);
        selectElementEdit.appendChild(option.cloneNode(true));
      }
      
    } catch (error) {
      console.error("Falha ao popular dropdown de categorias:", error);
      // Adiciona uma opção de erro no dropdown
      selectElement.innerHTML = '<option value="" disabled>Falha ao carregar categorias</option>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
      populaDropdownCategorias();
  });
})();
