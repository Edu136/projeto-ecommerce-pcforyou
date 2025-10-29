// js/main.js

// --- IMPORTS ---
import { productsData } from './data.js';
import { validaCep } from './utils/helpers.js';
import { fetchAddressByCep } from './services/cep.js';
import { openCart, closeCart, toggleMobileMenu, showSection } from './components/ui.js';
import { renderProducts, applyFiltersAndSort, openProductModal, closeProductModal } from './components/product.js';
import { updateCartUI, addToCart, removeFromCart } from './components/cart.js';
import { openLoginModal, closeLoginModal, openRegisterModal, closeRegisterModal, handleLogin, handleRegister, handleLogout, updateUserUI, handleForgotPassword } from './components/auth.js';
import { apiListAddresses } from './services/api.js';
import { initCheckout, renderAddressList, showNewAddressForm } from './components/checkout.js';
import { initPix } from './components/pix.js';

document.addEventListener('DOMContentLoaded', () => {

    const eCommerceApp = {
        // --- ESTADO (STATE) ---
        state: {
            products: [],
            cart: [],
            addresses: [],
            currentUser: null,
            checkoutIntent: false,
        },

        // --- ELEMENTOS DO DOM ---
        elements: {
            // --- GERAL & NAVEGAÃ‡ÃƒO ---
            btnMenu: document.getElementById('btn-menu'),
            mobileMenu: document.getElementById('mobile-menu'),
            mainSections: document.querySelectorAll('main > section:not(#checkout-section):not(#confirmation)'),

            // --- AUTENTICAÃ‡ÃƒO & USUÃRIO (HEADER) ---
            userLoggedOutView: document.getElementById('user-logged-out'),
            userLoggedInView: document.getElementById('user-logged-in'),
            userLoginLink: document.getElementById('user-login-link'),
            userWelcomeMessage: document.getElementById('user-welcome-message'),
            btnAccount: document.getElementById('btn-account'),
            userLogoutButton: document.getElementById('user-logout-button'),

            // --- FILTROS DE PRODUTOS ---
            searchInput: document.getElementById('search'),
            categoryFilter: document.getElementById('filter-category'),
            sortFilter: document.getElementById('sort'),

            // --- NAV LINKS (HOME/CATALOG) ---
            homeLinks: document.querySelectorAll('a[href="#home"]'),
            catalogLinks: document.querySelectorAll('a[href="#catalog"]'),
            checkoutLinks: document.querySelectorAll('a[href="#checkout-section"]'),

            // --- LISTA DE PRODUTOS ---
            productList: document.getElementById('product-list'),

            // --- MODAL DE PRODUTO ---
            productModal: document.getElementById('product-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalImage: document.getElementById('modal-image'),
            modalDesc: document.getElementById('modal-desc'),
            modalPrice: document.getElementById('modal-price'),
            modalAddCart: document.getElementById('modal-add-cart'),
            modalClose: document.getElementById('modal-close'),
            // Minha Conta
            accountSection: document.getElementById('account'),
            accountName: document.getElementById('account-name'),
            accountEmail: document.getElementById('account-email'),
            accountAddresses: document.getElementById('account-addresses'),
            accountNoAddress: document.getElementById('account-no-address'),
            accountRefresh: document.getElementById('account-refresh'),

            // --- CARRINHO (SIDEBAR E BOTÃƒO) ---
            btnOpenCart: document.getElementById('btn-open-cart'),
            cartSidebar: document.getElementById('cart'),
            cartClose: document.getElementById('cart-close'),
            cartItems: document.getElementById('cart-items'),
            cartTotal: document.getElementById('cart-total'),
            cartCount: document.getElementById('cart-count'),
            cartFooter: document.getElementById('cart-footer'),
            cartEmptyMessage: document.getElementById('cart-empty-message'),
            navCartLink: document.getElementById('nav-cart-link'),
            mobileNavCartLink: document.getElementById('mobile-nav-cart-link'),

            // --- CHECKOUT ---
            btnCheckout: document.getElementById('btn-checkout'), 
            checkoutSection: document.getElementById('checkout-section'),
            checkoutUserName: document.getElementById('checkout-user-name'),
            checkoutUserEmail: document.getElementById('checkout-user-email'),

            // Etapa de EndereÃ§o
            addressStep: document.getElementById('address-step'),
            addressSelection: document.getElementById('address-selection'),
            addressList: document.getElementById('address-list'),
            noAddressMessage: document.getElementById('no-address-message'),
            btnShowNewAddressForm: document.getElementById('btn-show-new-address-form'),

            // FormulÃ¡rio de Novo EndereÃ§o
            newAddressFormContainer: document.getElementById('new-address-form-container'),
            checkoutForm: document.getElementById('checkout-form'),
            cep: document.getElementById("cep"),
            address: document.getElementById("address"), // Padronizado de 'rua' para 'address'
            number: document.getElementById("number"),
            complement: document.getElementById("complement"),
            bairro: document.getElementById("bairro"),
            cidade: document.getElementById("cidade"),
            estado: document.getElementById("estado"),
        
            // Etapa de Pagamento
            paymentSection: document.getElementById('payment-section'),
            paymentDetails: document.getElementById('payment-details'),
            btnFinalizePurchase: document.getElementById('btn-finalize-purchase'),
            btnBackToAddress: document.getElementById('btn-back-to-address'), // <-- ADICIONE ESTA LINHA
            orderSummary: document.getElementById('order-summary'), 

            // --- TELA DE CONFIRMAÃ‡ÃƒO ---
            confirmationSection: document.getElementById('confirmation'),
            orderCode: document.getElementById('order-code'),
            btnBackHome: document.getElementById('btn-back-home'),

            // --- MODAIS DE LOGIN & REGISTRO ---
            loginModal: document.getElementById('login-modal'),
            loginModalClose: document.getElementById('login-modal-close'),
            loginForm: document.getElementById('login-form'),
            loginErrorMessage: document.getElementById('login-error-message'),
            showRegisterModalBtn: document.getElementById('show-register-modal'),
            forgotPasswordModal: document.getElementById('forgot-password-modal'),
            forgotPasswordClose: document.getElementById('forgot-password-close'),
            forgotPasswordCancel: document.getElementById('forgot-password-cancel'),
            forgotPasswordForm: document.getElementById('forgot-password-form'),
            forgotPasswordEmail: document.getElementById('forgot-password-email'),
            forgotPasswordNew: document.getElementById('forgot-password-new'),
            forgotPasswordConfirm: document.getElementById('forgot-password-confirm'),
            forgotPasswordMessage: document.getElementById('forgot-password-message'),
            registerModal: document.getElementById('register-modal'),
            registerModalClose: document.getElementById('register-modal-close'),
            registerForm: document.getElementById('register-form'),
            registerErrorMessage: document.getElementById('register-error-message'),
            showLoginModalBtn: document.getElementById('show-login-modal'),
            forgotPasswordButton: document.getElementById('forgot-password'),
        },

        // --- INICIALIZAÃ‡ÃƒO ---
        init() {
            this.state.products = [];
            this.bindEvents();

            initCheckout(this.state, this.elements, () => this.handleFinalizePurchase());
            
            // RenderizaÃ§Ãµes Iniciais
            applyFiltersAndSort(this.state, this.elements);
            updateCartUI(this.state, this.elements);
            updateUserUI(this.state, this.elements);

            // Carregamento de produtos Ã© feito apÃ³s definir helpers de API
        },

        // --- VINCULAR EVENTOS ---
        bindEvents() {
            const { elements, state } = this;
            const on = (target, evt, handler) => {
                if (target && typeof target.addEventListener === 'function') {
                    target.addEventListener(evt, handler);
                }
            };
            const onList = (list, evt, handler) => {
                if (!list || typeof list.forEach !== 'function') return;
                list.forEach(el => on(el, evt, handler));
            };
            const forgotMsgEl = elements.forgotPasswordMessage;
            const showForgotMessage = (text = '', isError = false) => {
                if (!forgotMsgEl) return;
                if (!text) {
                    forgotMsgEl.textContent = '';
                    forgotMsgEl.classList.add('hidden');
                    forgotMsgEl.classList.remove('text-red-500', 'text-green-600');
                    return;
                }
                forgotMsgEl.textContent = text;
                forgotMsgEl.classList.remove('hidden', 'text-red-500', 'text-green-600');
                forgotMsgEl.classList.add(isError ? 'text-red-500' : 'text-green-600');
            };
            const resetForgotForm = () => {
                elements.forgotPasswordForm?.reset();
                showForgotMessage('');
            };
            const openForgotModal = () => {
                resetForgotForm();
                elements.forgotPasswordModal?.classList.remove('hidden');
                setTimeout(() => elements.forgotPasswordEmail?.focus(), 50);
            };
            const closeForgotModal = () => {
                elements.forgotPasswordModal?.classList.add('hidden');
            };

            on(elements.searchInput, 'input', () => applyFiltersAndSort(state, elements));
            on(elements.categoryFilter, 'change', () => applyFiltersAndSort(state, elements));
            on(elements.sortFilter, 'change', () => applyFiltersAndSort(state, elements));

            on(elements.productList, 'click', (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;
                const { id, action } = button.dataset;
                if (action === 'details') openProductModal(id, state, elements);
                else if (action === 'add') addToCart(id, state, elements);
            });

            on(elements.modalClose, 'click', () => closeProductModal(elements));
            on(elements.productModal, 'click', (e) => {
                if (e.target === elements.productModal) closeProductModal(elements);
            });
            on(elements.modalAddCart, 'click', (e) => {
                addToCart(e.target.dataset.id, state, elements);
                closeProductModal(elements);
            });

            on(elements.btnOpenCart, 'click', () => openCart(elements));
            on(elements.navCartLink, 'click', () => openCart(elements));
            on(elements.cartClose, 'click', () => closeCart(elements));
            on(elements.cartItems, 'click', (e) => {
                const button = e.target.closest('button[data-action="remove"]');
                if (button) removeFromCart(button.dataset.id, state, elements);
            });

            on(elements.btnCheckout, 'click', () => this.handleCheckoutAttempt());
            on(elements.btnBackHome, 'click', () => {
                showSection(document.getElementById('home'), { alsoShow: [document.getElementById('catalog')] });
                loadProductsFromApi(this.state, this.elements);
            });

            onList(elements.homeLinks, 'click', (e) => {
                e.preventDefault();
                showSection(document.getElementById('home'), { alsoShow: [document.getElementById('catalog')] });
                elements.mobileMenu?.classList.add('hidden');
                loadProductsFromApi(this.state, this.elements);
            });
            onList(elements.catalogLinks, 'click', (e) => {
                e.preventDefault();
                showSection(document.getElementById('catalog'));
                elements.mobileMenu?.classList.add('hidden');
                loadProductsFromApi(this.state, this.elements);
            });
            onList(elements.checkoutLinks, 'click', async (e) => {
                e.preventDefault();
                elements.mobileMenu?.classList.add('hidden');
                await this.handleCheckoutAttempt();
            });

            on(elements.btnMenu, 'click', () => toggleMobileMenu(elements));
            on(elements.mobileNavCartLink, 'click', (e) => {
                e.preventDefault();
                elements.mobileMenu.classList.add('hidden');
                openCart(elements);
            });

            on(elements.userLoginLink, 'click', (e) => {
                e.preventDefault();
                state.checkoutIntent = false;
                openLoginModal(elements);
            });
            on(elements.userLogoutButton, 'click', (e) => {
                e.preventDefault();
                state.selectedAddressId = null;
                handleLogout(state, elements);
            });
            on(elements.btnAccount, 'click', async () => { await this.showAccount(); });
            on(elements.loginModalClose, 'click', () => closeLoginModal(elements));
            on(elements.registerModalClose, 'click', () => closeRegisterModal(elements));
            on(elements.showRegisterModalBtn, 'click', () => { closeLoginModal(elements); openRegisterModal(elements); });
            on(elements.showLoginModalBtn, 'click', () => { closeRegisterModal(elements); openLoginModal(elements); });
            on(elements.forgotPasswordButton, 'click', (e) => {
                e.preventDefault();
                openForgotModal();
            });
            on(elements.forgotPasswordClose, 'click', closeForgotModal);
            on(elements.forgotPasswordCancel, 'click', closeForgotModal);
            on(elements.forgotPasswordModal, 'click', (e) => {
                if (e.target === elements.forgotPasswordModal) closeForgotModal();
            });
            on(elements.forgotPasswordForm, 'submit', async (e) => {
                e.preventDefault();
                const email = elements.forgotPasswordEmail?.value || '';
                const newPassword = elements.forgotPasswordNew?.value || '';
                const confirmPassword = elements.forgotPasswordConfirm?.value || '';
                if (newPassword !== confirmPassword) {
                    showForgotMessage('As senhas não coincidem.', true);
                    return;
                }
                const submitBtn = elements.forgotPasswordForm?.querySelector('button[type="submit"]');
                submitBtn?.setAttribute('disabled', 'disabled');
                submitBtn?.classList.add('opacity-70');
                try {
                    const ok = await handleForgotPassword(state, elements, { email, newPassword });
                    if (ok) {
                        const loginEmailInput = this.elements.loginForm?.querySelector('#login-email');
                        if (loginEmailInput) loginEmailInput.value = email;
                        setTimeout(() => {
                            closeForgotModal();
                            const loginPasswordInput = this.elements.loginForm?.querySelector('#login-password');
                            loginPasswordInput?.focus();
                        }, 1500);
                    }
                } finally {
                    submitBtn?.removeAttribute('disabled');
                    submitBtn?.classList.remove('opacity-70');
                }
            });
            on(elements.loginForm, 'submit', (e) => handleLogin(e, state, elements, () => this.handleCheckoutAttempt()));
            on(elements.registerForm, 'submit', (e) => handleRegister(e, state, elements, () => this.handleCheckoutAttempt()));

            on(elements.cep, 'blur', async () => {
                if (!validaCep(elements.cep.value)) return;
                const data = await fetchAddressByCep(elements.cep.value);
                if (data) {
                    elements.bairro.value = data.bairro;
                    elements.address.value = data.logradouro;
                    elements.cidade.value = data.localidade;
                    elements.estado.value = data.estado;
                }
            });

            try {
                const toHide = document.querySelectorAll('input[name="payment-method"][value="credit-card"], input[name="payment-method"][value="boleto"]');
                toHide.forEach(inp => {
                    const label = inp.closest('label');
                    if (label) label.classList.add('hidden');
                });
                const pixRadio = document.querySelector('input[name="payment-method"][value="pix"]');
                if (pixRadio) pixRadio.checked = true;
        } catch {}
        },
        
        // --- Lógica de CHECKOUT (Orquestração) ---
        async handleCheckoutAttempt() {
            if (!Array.isArray(this.state.cart) || this.state.cart.length === 0) {
                this.state.checkoutIntent = false;
                alert("Adicione itens ao carrinho antes de ir para o checkout.");
                return;
            }
            if (this.state.currentUser) {
                this.state.checkoutIntent = false;
                await this.showCheckout();
            } else {
                this.state.checkoutIntent = true;
                openLoginModal(this.elements);
            }
        },

        async showCheckout() {
            closeCart(this.elements);
            this.elements.checkoutUserName.textContent = this.state.currentUser.name;
            this.elements.checkoutUserEmail.textContent = this.state.currentUser.email;

            if (this.state.currentUser?.id) {
                const previous = Array.isArray(this.state.currentUser.addresses)
                    ? [...this.state.currentUser.addresses]
                    : [];
                try {
                    const list = await apiListAddresses(this.state.currentUser.id);
                    this.state.currentUser.addresses = Array.isArray(list) ? list : [];
                } catch {
                    this.state.currentUser.addresses = previous;
                }
            }

            const addresses = this.state.currentUser.addresses || [];
            if (addresses.length > 0) {
                const selectedExists = addresses.some(addr => String(addr.id) === String(this.state.selectedAddressId));
                if (!selectedExists) {
                    this.state.selectedAddressId = addresses[0].id;
                }
                renderAddressList(this.state.currentUser, this.elements, this.state.selectedAddressId);
                this.elements.newAddressFormContainer.classList.add('hidden');
                this.elements.addressSelection.classList.remove('hidden');
                this.elements.paymentSection.classList.add('hidden');
                this.elements.addressStep.classList.remove('hidden');
            } else {
                showNewAddressForm(this.elements);
            }

            this.elements.paymentSection.classList.add('hidden');
            this.elements.addressStep.classList.remove('hidden');

            showSection(this.elements.checkoutSection);
        },

        async showAccount() {
            if (!this.state.currentUser) {
                this.state.checkoutIntent = false;
                openLoginModal(this.elements);
                return;
            }
            const u = this.state.currentUser;
            this.elements.accountName.textContent = u.name || '-';
            this.elements.accountEmail.textContent = u.email || '-';
            if (u.id) {
                try {
                    const list = await apiListAddresses(u.id);
                    this.state.currentUser.addresses = Array.isArray(list) ? list : [];
                } catch {}
            }
            this.renderAccountAddresses();
            showSection(this.elements.accountSection);
            // wire refresh click
            if (this.elements.accountRefresh && !this._refreshBound) {
                this._refreshBound = true;
                this.elements.accountRefresh.addEventListener('click', async () => {
                    if (!this.state.currentUser?.id) return;
                    try {
                        const list = await apiListAddresses(this.state.currentUser.id);
                        this.state.currentUser.addresses = Array.isArray(list) ? list : [];
                        this.renderAccountAddresses();
                    } catch {}
                });
            }
        },

        renderAccountAddresses() {
            const list = this.state.currentUser?.addresses || [];
            const box = this.elements.accountAddresses;
            const empty = this.elements.accountNoAddress;
            box.innerHTML = '';
            if (list.length === 0) {
                empty.classList.remove('hidden');
                return;
            }
            empty.classList.add('hidden');
            for (const a of list) {
                const div = document.createElement('div');
                div.className = 'p-3 border rounded-md';
                div.innerHTML = `<div class=\"font-semibold\">${a.logradouro}, ${a.numero}</div>
                                 <div class=\"text-sm text-gray-600\">${a.bairro} - ${a.cidade}/${a.estado} â€¢ CEP: ${a.cep || ''}</div>
                                 ${a.complemento ? `<div class=\"text-sm text-gray-600\">${a.complemento}</div>` : ''}`;
                box.appendChild(div);
            }
        },


        handleFinalizePurchase() {
            // Lógica final de compra
            alert("Compra finalizada com sucesso! (Simulação)");
            const orderCode = `PCFY-${Date.now().toString().slice(-6)}`;
            document.getElementById('order-code').textContent = orderCode;
            document.body.style.overflow = 'auto';
            document.body.style.overflowY = 'auto';
            document.documentElement.style.overflow = 'auto';
            document.documentElement.style.overflowY = 'auto';
            showSection(this.elements.confirmationSection);
            this.state.cart = [];
            this.state.checkoutIntent = false;
            updateCartUI(this.state, this.elements);
            this.elements.checkoutForm.reset();
            // recarrega catálogo
            loadProductsFromApi(this.state, this.elements);
        },
    };

    eCommerceApp.init();

    // ---- IntegraÃ§Ã£o com backend de produtos ----
    const LS_API_KEY = 'pcfy_api_base';
    const API_DEFAULT = 'http://localhost:8080';
    const PLACEHOLDER_IMG = 'assets/images/NBK_ASUS_ROG.jpeg';

    function getApiBase() {
        try { return localStorage.getItem(LS_API_KEY) || API_DEFAULT; } catch { return API_DEFAULT; }
    }

    function mapProdutoDtoToUi(dto) {
        return {
            id: dto.id,
            name: dto.nome ?? `Produto ${dto.id}`,
            price: dto.preco ?? 0,
            description: dto.descricao ?? '',
            image: `${getApiBase()}/images/first/${dto.id}`,
            category: '',
            bestSeller: false,
        };
    }

    async function loadProductsFromApi(state, elements) {
        const base = getApiBase();
        try {
            const res = await fetch(`${base}/produtos/DISPONIVEL`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data.map(mapProdutoDtoToUi) : [];
            state.products = list;
            applyFiltersAndSort(state, elements);
        } catch (e) {
            // fallback para dados locais se necessÃ¡rio
            state.products = productsData.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                description: p.description,
                image: p.image || PLACEHOLDER_IMG,
                category: p.category || '',
                bestSeller: !!p.bestSeller,
            }));
            applyFiltersAndSort(state, elements);
            console.warn('Falha ao carregar produtos do backend:', e?.message);
        }
    }
    // Depois que helpers foram definidos, carrega produtos do backend
    loadProductsFromApi(eCommerceApp.state, eCommerceApp.elements);
});



















