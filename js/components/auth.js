// js/components/auth.js

// --- Funções de Controle dos Modais ---
export function openLoginModal(elements) { elements.loginModal.classList.remove('hidden'); }
export function closeLoginModal(elements) { elements.loginModal.classList.add('hidden'); elements.loginForm.reset(); }
export function openRegisterModal(elements) { elements.registerModal.classList.remove('hidden'); }
export function closeRegisterModal(elements) { elements.registerModal.classList.add('hidden'); elements.registerForm.reset(); }

// --- Lógica de Ações do Usuário ---
export function handleLogin(event, state, elements, checkoutCallback) {
    event.preventDefault();
    elements.loginErrorMessage.classList.add('hidden');
    const email = elements.loginForm.querySelector('#login-email').value;
    const password = elements.loginForm.querySelector('#login-password').value;

    const user = state.users.find(u => u.email === email && u.password === password);

    if (user) {
        state.currentUser = user;
        updateUserUI(state, elements);
        closeLoginModal(elements);
        if (checkoutCallback) checkoutCallback();
    } else {
        elements.loginErrorMessage.classList.remove('hidden');
        setTimeout(() => {
            elements.loginErrorMessage.classList.add('hidden');
        }, 5000);
    }
}

export function handleRegister(event, state, elements, checkoutCallback) {
    event.preventDefault();
    elements.registerErrorMessage.innerHTML = '';
    elements.registerErrorMessage.classList.add('hidden');
    const name = elements.registerForm.querySelector('#register-name').value;
    const email = elements.registerForm.querySelector('#register-email').value;
    const password = elements.registerForm.querySelector('#register-password').value;

    if (state.users.some(u => u.email === email)) {
        elements.registerErrorMessage.classList.remove('hidden');
        elements.registerErrorMessage.innerHTML = 'Este e-mail já está em uso. <br> Por favor, use outro e-mail ou faça login.';
        setTimeout(() => {
            elements.registerErrorMessage.classList.add('hidden');
        }, 5000);
        return;
    }

    const newUser = { name, email, password , addresses: []};
    state.users.push(newUser);
    state.currentUser = newUser;

    alert('Cadastro realizado com sucesso! Você já está logado.');
    updateUserUI(state, elements);
    closeRegisterModal(elements);
    if (checkoutCallback) checkoutCallback();
}

export function handleLogout(state, elements) {
    state.currentUser = null;
    updateUserUI(state, elements);
}

// --- Atualização da UI ---
export function updateUserUI(state, elements) {
    const isLoggedIn = !!state.currentUser;

    if (isLoggedIn) {
        elements.userLoggedInView.classList.remove('hidden');
        elements.userLoggedInView.classList.add('flex');
        elements.userLoggedOutView.classList.add('hidden');
        const firstName = state.currentUser.name.split(' ')[0];
        elements.userWelcomeMessage.textContent = `Olá, ${firstName}`;
    } else {
        elements.userLoggedOutView.classList.remove('hidden');
        elements.userLoggedInView.classList.add('hidden');
        elements.userLoggedInView.classList.remove('flex');
    }
}