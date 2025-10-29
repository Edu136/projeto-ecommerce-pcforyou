// js/services/api.js
const LS_API_KEY = 'pcfy_api_base';
const API_DEFAULT = 'http://localhost:8080';

export function getApiBase() {
  try { return localStorage.getItem(LS_API_KEY) || API_DEFAULT; } catch { return API_DEFAULT; }
}

async function handleJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

export async function apiJson(url, options = {}) {
  const base = getApiBase();
  const res = await fetch(base + url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await handleJson(res);
    const msg = typeof body === 'string' ? body : (body?.message || `${res.status} ${res.statusText}`);
    throw new Error(msg);
  }
  return handleJson(res);
}

// USERS
export async function apiRegisterUser({ nome, email, senha }) {
  const payload = { email, nome, senha };
  return apiJson('/users/add', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiLogin({ email, senha }) {
  const payload = { email, senha };
  return apiJson('/users/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiChangePassword({ email, newPassword }) {
  const target = typeof email === 'string' ? email.trim() : '';
  if (!target) throw new Error('Email é obrigatório para alterar a senha.');
  const payload = { novaSenha: newPassword, password: newPassword, senha: newPassword };
  return apiJson(`/users/editPassword/${encodeURIComponent(target)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

// Optional: buscar usuário por email, caso o backend exponha
export async function apiGetUserByEmail(email) {
  return apiJson(`/users/by-email?email=${encodeURIComponent(email)}`, { method: 'GET' });
}

// ENDERECOS
export async function apiListAddresses(userId) {
  return apiJson(`/enderecos/user/${encodeURIComponent(userId)}`, { method: 'GET' });
}

export async function apiAddAddress(addr) {
  // Espera EnderecoCreateDTO exato
  const payload = {
    cep: addr.cep,
    logradouro: addr.logradouro,
    complemento: addr.complemento || null,
    numero: addr.numero,
    bairro: addr.bairro,
    cidade: addr.cidade,
    estado: addr.estado,
    userId: addr.userId,
  };
  return apiJson('/enderecos/add', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiEditAddress(id, addr) {
  const payload = {
    cep: addr.cep,
    logradouro: addr.logradouro,
    complemento: addr.complemento || null,
    numero: addr.numero,
    bairro: addr.bairro,
    cidade: addr.cidade,
    estado: addr.estado,
    userId: addr.userId,
  };
  return apiJson(`/enderecos/edit/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function apiDeleteAddress(id) {
  return apiJson(`/enderecos/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function criarPedidoNoBanco(userId, cart) {
  
  const itensDTO = cart.map(item => ({
    produtoId: item.id,
    quantidade: item.quantity || 1
  }));

  const pedidoRequest = {
    userId: Number(userId), 
    itens: itensDTO
  };

  console.log("Enviando pedido para o backend:", pedidoRequest);

  try {
    const response = await fetch('http://localhost:8080/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoRequest)
    });

    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('Erro ao criar pedido:', errorData);
      throw new Error(errorData.message || 'Falha ao registrar o pedido. Verifique o console.');
    }

    const pedidoCriado = await response.json();
    console.log("Pedido criado com sucesso:", pedidoCriado);
    return pedidoCriado;

  } catch (error) {
    console.error('Erro de rede ou lógica ao criar pedido:', error);
    alert(`Erro ao finalizar pedido: ${error.message}`);
    return null; 
  }
}


export async function apiListPedidos(userId) {
  
  const url = `http://localhost:8080/pedidos/user/${userId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao buscar pedidos');
    }

    return response.json(); 

  } catch (error) {
    console.error(`Erro na apiListPedidos (GET ${url}):`, error);
    if (error.message.includes('Failed to fetch')) {
        throw new Error('Erro de rede ou CORS. Verifique o console e o backend.');
    }
    throw error;
  }
}






