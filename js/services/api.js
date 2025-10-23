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

export async function apiChangePassword({ id, newPassword }) {
  const payload = { novaSenha: newPassword, password: newPassword, senha: newPassword };
  return apiJson(`/users/editPassword/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
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
