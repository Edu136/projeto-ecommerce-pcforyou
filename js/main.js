// js/main.js

// --- IMPORTS ---
import { productsData } from './data.js';
import { validaCep } from './utils/helpers.js';
import { fetchAddressByCep } from './services/cep.js';
import { openCart, closeCart, toggleMobileMenu, showSection } from './components/ui.js';
import { renderProducts, applyFiltersAndSort, openProductModal, closeProductModal } from './components/product.js';
import { updateCartUI, addToCart, removeFromCart } from './components/cart.js';
import { openLoginModal, closeLoginModal, openRegisterModal, closeRegisterModal, handleLogin, handleRegister, handleLogout, updateUserUI } from './components/auth.js';
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
        },

        // --- ELEMENTOS DO DOM ---
        elements: {
            // --- GERAL & NAVEGAÇÃO ---
            btnMenu: document.getElementById('btn-menu'),
            mobileMenu: document.getElementById('mobile-menu'),
            mainSections: document.querySelectorAll('main > section:not(#checkout-section):not(#confirmation)'),

            // --- AUTENTICAÇÃO & USUÁRIO (HEADER) ---
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

            // --- CARRINHO (SIDEBAR E BOTÃO) ---
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

            // Etapa de Endereço
            addressStep: document.getElementById('address-step'),
            addressSelection: document.getElementById('address-selection'),
            addressList: document.getElementById('address-list'),
            noAddressMessage: document.getElementById('no-address-message'),
            btnShowNewAddressForm: document.getElementById('btn-show-new-address-form'),

            // Formulário de Novo Endereço
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

            // --- TELA DE CONFIRMAÇÃO ---
            confirmationSection: document.getElementById('confirmation'),
            orderCode: document.getElementById('order-code'),
            btnBackHome: document.getElementById('btn-back-home'),

            // --- MODAIS DE LOGIN & REGISTRO ---
            loginModal: document.getElementById('login-modal'),
            loginModalClose: document.getElementById('login-modal-close'),
            loginForm: document.getElementById('login-form'),
            loginErrorMessage: document.getElementById('login-error-message'),
            showRegisterModalBtn: document.getElementById('show-register-modal'),
            registerModal: document.getElementById('register-modal'),
            registerModalClose: document.getElementById('register-modal-close'),
            registerForm: document.getElementById('register-form'),
            registerErrorMessage: document.getElementById('register-error-message'),
            showLoginModalBtn: document.getElementById('show-login-modal'),
        },

        // --- INICIALIZAÇÃO ---
        init() {
            this.state.products = [];
            this.bindEvents();

            initCheckout(this.state, this.elements, () => this.handleFinalizePurchase());
            
            // Renderizações Iniciais
            applyFiltersAndSort(this.state, this.elements);
            updateCartUI(this.state, this.elements);
            updateUserUI(this.state, this.elements);

            // Carregamento de produtos é feito após definir helpers de API
        },

        // --- VINCULAR EVENTOS ---
        bindEvents() {
            const { elements, state } = this;

            // Filtros e Ordenação
            elements.searchInput.addEventListener('input', () => applyFiltersAndSort(state, elements));
            elements.categoryFilter.addEventListener('change', () => applyFiltersAndSort(state, elements));
            elements.sortFilter.addEventListener('change', () => applyFiltersAndSort(state, elements));

            // Ações de Produtos (Delegação de Eventos)
            elements.productList.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;
                const { id, action } = button.dataset;
                if (action === 'details') openProductModal(id, state, elements);
                else if (action === 'add') addToCart(id, state, elements);
            });

            // Modal de Produto
            elements.modalClose.addEventListener('click', () => closeProductModal(elements));
            elements.productModal.addEventListener('click', (e) => {
                if (e.target === elements.productModal) closeProductModal(elements);
            });
            elements.modalAddCart.addEventListener('click', (e) => {
                addToCart(e.target.dataset.id, state, elements);
                closeProductModal(elements);
            });

            // Carrinho
            elements.btnOpenCart.addEventListener('click', () => openCart(elements));
            elements.navCartLink.addEventListener('click', () => openCart(elements));
            elements.cartClose.addEventListener('click', () => closeCart(elements));
            elements.cartItems.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action="remove"]');
                if (button) removeFromCart(button.dataset.id, state, elements);
            });

            // Checkout
            elements.btnCheckout.addEventListener('click', () => this.handleCheckoutAttempt());
            // O submit do checkout é tratado em js/components/checkout.js (initCheckout)
            elements.btnBackHome.addEventListener('click', () => {
                showSection(document.getElementById('home'));
                loadProductsFromApi(this.state, this.elements);
            });

            // Navegação básica (Home / Produtos)
            elements.homeLinks.forEach(a => a.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(document.getElementById('home'));
                elements.mobileMenu?.classList.add('hidden');
                // opcional: recarrega catálogo em background
                loadProductsFromApi(this.state, this.elements);
            }));
            elements.catalogLinks.forEach(a => a.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(document.getElementById('catalog'));
                elements.mobileMenu?.classList.add('hidden');
                loadProductsFromApi(this.state, this.elements);
            }));

            // Menu Mobile
            elements.btnMenu.addEventListener('click', () => toggleMobileMenu(elements));
            elements.mobileNavCartLink.addEventListener('click', (e) => {
                e.preventDefault();
                elements.mobileMenu.classList.add('hidden');
                openCart(elements);
            });

            // Autenticação
            elements.userLoginLink.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(elements); });
            elements.userLogoutButton.addEventListener('click', (e) => { e.preventDefault(); handleLogout(state, elements); });
            if (elements.btnAccount) {
                elements.btnAccount.addEventListener('click', async () => { await this.showAccount(); });
            }
            elements.loginModalClose.addEventListener('click', () => closeLoginModal(elements));
            elements.registerModalClose.addEventListener('click', () => closeRegisterModal(elements));
            elements.showRegisterModalBtn.addEventListener('click', () => { closeLoginModal(elements); openRegisterModal(elements); });
            elements.showLoginModalBtn.addEventListener('click', () => { closeRegisterModal(elements); openLoginModal(elements); });
            elements.loginForm.addEventListener('submit', (e) => handleLogin(e, state, elements, () => this.handleCheckoutAttempt()));
            elements.registerForm.addEventListener('submit', (e) => handleRegister(e, state, elements, () => this.handleCheckoutAttempt()));

            // API de CEP
            elements.cep.addEventListener('blur', async () => {
                if (!validaCep(elements.cep.value)) return;
                const data = await fetchAddressByCep(elements.cep.value);
                if (data) {
                    elements.bairro.value = data.bairro;
                    elements.address.value = data.logradouro;
                    elements.cidade.value = data.localidade;
                    elements.estado.value = data.estado;
                }
            });

            // Oculta opções de pagamento Cartão de Crédito e Boleto
            try {
                const toHide = document.querySelectorAll('input[name="payment-method"][value="credit-card"], input[name="payment-method"][value="boleto"]');
                toHide.forEach(inp => {
                    const label = inp.closest('label');
                    if (label) label.classList.add('hidden');
                });
                // Define PIX como padrão se existir
                const pixRadio = document.querySelector('input[name="payment-method"][value="pix"]');
                if (pixRadio) pixRadio.checked = true;
            } catch {}
        },
        
        // --- LÓGICA DE CHECKOUT (Orquestração) ---
        handleCheckoutAttempt() {
            if (this.state.cart.length === 0) return;
            if (this.state.currentUser) {
                this.showCheckout();
            } else {
                openLoginModal(this.elements);
            }
        },

        // showCheckout() {
        //     closeCart(this.elements);
        //     this.elements.checkoutUserName.textContent = this.state.currentUser.name;
        //     this.elements.checkoutUserEmail.textContent = this.state.currentUser.email;
        //     showSection(this.elements.checkoutSection);
        // },

        showCheckout() {
            closeCart(this.elements);
            this.elements.checkoutUserName.textContent = this.state.currentUser.name;
            this.elements.checkoutUserEmail.textContent = this.state.currentUser.email;

            // Lógica para exibir endereços ou formulário
            // tenta buscar endereços do backend, se tivermos ID
            if (this.state.currentUser?.id) {
                apiListAddresses(this.state.currentUser.id)
                    .then(list => {
                        this.state.currentUser.addresses = Array.isArray(list) ? list : [];
                        if (this.state.currentUser.addresses.length > 0) {
                            if (!this.state.selectedAddressId) {
                                this.state.selectedAddressId = this.state.currentUser.addresses[0].id;
                            }
                            renderAddressList(this.state.currentUser, this.elements);
                            this.elements.newAddressFormContainer.classList.add('hidden');
                            this.elements.addressSelection.classList.remove('hidden');
                        }
                    })
                    .catch(() => { /* mantém o que já tiver */ });
            }
            if (this.state.currentUser.addresses && this.state.currentUser.addresses.length > 0) {
                if (!this.state.selectedAddressId) {
                    this.state.selectedAddressId = this.state.currentUser.addresses[0].id;
                }
                renderAddressList(this.state.currentUser, this.elements);
                this.elements.newAddressFormContainer.classList.add('hidden');
                this.elements.addressSelection.classList.remove('hidden');
            } else {
                showNewAddressForm(this.elements);
            }

            // Garante que a seção de pagamento comece escondida
            this.elements.paymentSection.classList.add('hidden');
            this.elements.addressStep.classList.remove('hidden');

            showSection(this.elements.checkoutSection);
        },

        async showAccount() {
            if (!this.state.currentUser) { openLoginModal(this.elements); return; }
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
                                 <div class=\"text-sm text-gray-600\">${a.bairro} - ${a.cidade}/${a.estado} • CEP: ${a.cep || ''}</div>
                                 ${a.complemento ? `<div class=\"text-sm text-gray-600\">${a.complemento}</div>` : ''}`;
                box.appendChild(div);
            }
        },


        handleFinalizePurchase() {
            // Lógica final de compra
            alert("Compra finalizada com sucesso! (Simulação)");
            const orderCode = `PCFY-${Date.now().toString().slice(-6)}`;
            document.getElementById('order-code').textContent = orderCode;
            showSection(this.elements.confirmationSection);
            this.state.cart = [];
            updateCartUI(this.state, this.elements);
            this.elements.checkoutForm.reset();
            // recarrega catálogo
            loadProductsFromApi(this.state, this.elements);
        },
    };

    eCommerceApp.init();

    // ---- Integração com backend de produtos ----
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
            // fallback para dados locais se necessário
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
