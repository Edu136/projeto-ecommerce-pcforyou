// js/components/auth.js (API-driven)
import { apiRegisterUser, apiLogin, apiChangePassword, apiListAddresses } from '../services/api.js';

// Modais
export function openLoginModal(elements) { elements.loginModal.classList.remove('hidden'); }
export function closeLoginModal(elements) { elements.loginModal.classList.add('hidden'); elements.loginForm.reset(); }
export function openRegisterModal(elements) { elements.registerModal.classList.remove('hidden'); }
export function closeRegisterModal(elements) { elements.registerModal.classList.add('hidden'); elements.registerForm.reset(); }

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

    // --- 2. ADICIONE A SOLUÇÃO AQUI ---
    // Salva o usuário no localStorage para persistir o login
    try {
      // Salva o objeto 'currentUser' inteiro como uma string JSON
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      
      // Salva o 'userId' separadamente (para sua função de criar pedido)
      if (state.currentUser.id) {
        localStorage.setItem('userId', state.currentUser.id);
      }
    } catch (storageError) {
      console.error("Falha ao salvar no localStorage:", storageError);
      // (Não é um erro fatal, o usuário ainda está logado nesta sessão)
    }
    // --- FIM DA MODIFICAÇÃO ---

    // 3. Atualiza a UI e continua o fluxo
    updateUserUI(state, elements);
    closeLoginModal(elements);
    const wantsCheckout = !!state.checkoutIntent;
    state.checkoutIntent = false;
    if (checkoutCallback && wantsCheckout) checkoutCallback();
    
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
    const wantsCheckout = !!state.checkoutIntent;
    state.checkoutIntent = false;
    if (checkoutCallback && wantsCheckout) checkoutCallback();
  } catch (e) {
    elements.registerErrorMessage.classList.remove('hidden');
    elements.registerErrorMessage.innerHTML = e.message || 'Falha ao registrar. Tente novamente.';
    setTimeout(() => elements.registerErrorMessage.classList.add('hidden'), 5000);
  }
}

export function handleLogout(state, elements) {
  state.currentUser = null;
  state.checkoutIntent = false;
  updateUserUI(state, elements);
}

// Esqueci a senha (mÃ­nimo)
export async function handleForgotPassword(state, elements, { email, newPassword }) {
  const messageEl = elements?.forgotPasswordMessage;
  const showMessage = (text, isError = false) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden', 'text-red-500', 'text-green-600');
    messageEl.classList.add(isError ? 'text-red-500' : 'text-green-600');
  };

  const trimmedEmail = (email || '').trim();
  const trimmedPassword = (newPassword || '').trim();

  if (!trimmedEmail) {
    showMessage('Informe o e-mail cadastrado.', true);
    return false;
  }

  if (!trimmedPassword) {
    showMessage('Informe a nova senha.', true);
    return false;
  }

  try {
    await apiChangePassword({ email: trimmedEmail, newPassword: trimmedPassword });
    showMessage('Senha alterada com sucesso. Utilize a nova senha para entrar.');
    return true;
  } catch (e) {
    showMessage(e.message || 'Falha ao alterar senha. Tente novamente.', true);
    return false;
  }
}
// UI
export function updateUserUI(state, elements) {
  const isLoggedIn = !!state.currentUser;
  if (isLoggedIn) {
    elements.userLoggedInView.classList.remove('hidden');
    elements.userLoggedInView.classList.add('flex');
    elements.userLoggedOutView.classList.add('hidden');
    const firstName = (state.currentUser.name || '').split(' ')[0] || 'usuÃ¡rio';
    elements.userWelcomeMessage.textContent = `OlÃ¡, ${firstName}`;
  } else {
    elements.userLoggedOutView.classList.remove('hidden');
    elements.userLoggedInView.classList.add('hidden');
    elements.userLoggedInView.classList.remove('flex');
  }
}

