// js/components/auth.js (API-driven)
import { apiRegisterUser, apiLogin, apiChangePassword, apiListAddresses } from '../services/api.js';

// Modais
export function openLoginModal(elements) { elements.loginModal.classList.remove('hidden'); }
export function closeLoginModal(elements) { elements.loginModal.classList.add('hidden'); elements.loginForm.reset(); }
export function openRegisterModal(elements) { elements.registerModal.classList.remove('hidden'); }
export function closeRegisterModal(elements) { elements.registerModal.classList.add('hidden'); elements.registerForm.reset(); }

// Login via API
export async function handleLogin(event, state, elements, checkoutCallback) {
  event.preventDefault();
  elements.loginErrorMessage.classList.add('hidden');
  const email = elements.loginForm.querySelector('#login-email').value.trim();
  const senha = elements.loginForm.querySelector('#login-password').value;

  try {
    const user = await apiLogin({ email, senha });
    const addresses = Array.isArray(user?.enderecos) ? user.enderecos : (Array.isArray(user?.addresses) ? user.addresses : []);
    const nameGuess = email.includes('@') ? email.split('@')[0] : email;
    state.currentUser = {
      id: user?.id ?? null,
      name: user?.nome ?? user?.name ?? nameGuess,
      email: user?.email ?? email,
      addresses: addresses || []
    };
    if ((!state.currentUser.addresses || state.currentUser.addresses.length === 0) && state.currentUser.id) {
      try { state.currentUser.addresses = await apiListAddresses(state.currentUser.id); } catch {}
    }
    updateUserUI(state, elements);
    closeLoginModal(elements);
    if (checkoutCallback) checkoutCallback();
  } catch (e) {
    elements.loginErrorMessage.textContent = 'Email ou senha inválidos';
    elements.loginErrorMessage.classList.remove('hidden');
    setTimeout(() => elements.loginErrorMessage.classList.add('hidden'), 5000);
  }
}

// Registro via API
export async function handleRegister(event, state, elements, checkoutCallback) {
  event.preventDefault();
  elements.registerErrorMessage.innerHTML = '';
  elements.registerErrorMessage.classList.add('hidden');
  const nome = elements.registerForm.querySelector('#register-name').value.trim();
  const email = elements.registerForm.querySelector('#register-email').value.trim();
  const senha = elements.registerForm.querySelector('#register-password').value;

  try {
    const user = await apiRegisterUser({ nome, email, senha });
    state.currentUser = { id: user?.id ?? null, name: user?.nome ?? nome, email: user?.email ?? email, addresses: [] };
    alert('Cadastro realizado com sucesso! Você já está logado.');
    updateUserUI(state, elements);
    closeRegisterModal(elements);
    if (checkoutCallback) checkoutCallback();
  } catch (e) {
    elements.registerErrorMessage.classList.remove('hidden');
    elements.registerErrorMessage.innerHTML = e.message || 'Falha ao registrar. Tente novamente.';
    setTimeout(() => elements.registerErrorMessage.classList.add('hidden'), 5000);
  }
}

export function handleLogout(state, elements) {
  state.currentUser = null;
  updateUserUI(state, elements);
}

// Esqueci a senha (mínimo)
export async function handleForgotPassword(state) {
  const id = prompt('Informe seu ID de usuário para redefinir a senha:');
  if (!id) return;
  const newPass = prompt('Informe a nova senha:');
  if (!newPass) return;
  try { await apiChangePassword({ id, newPassword: newPass }); alert('Senha alterada com sucesso. Faça login novamente.'); }
  catch (e) { alert('Falha ao alterar senha: ' + (e.message || 'Erro desconhecido')); }
}

// UI
export function updateUserUI(state, elements) {
  const isLoggedIn = !!state.currentUser;
  if (isLoggedIn) {
    elements.userLoggedInView.classList.remove('hidden');
    elements.userLoggedInView.classList.add('flex');
    elements.userLoggedOutView.classList.add('hidden');
    const firstName = (state.currentUser.name || '').split(' ')[0] || 'usuário';
    elements.userWelcomeMessage.textContent = `Olá, ${firstName}`;
  } else {
    elements.userLoggedOutView.classList.remove('hidden');
    elements.userLoggedInView.classList.add('hidden');
    elements.userLoggedInView.classList.remove('flex');
  }
}

