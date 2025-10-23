// js/main.js

// --- IMPORTS ---
import { productsData } from './data.js';
import { validaCep } from './utils/helpers.js';
import { fetchAddressByCep } from './services/cep.js';
import { openCart, closeCart, toggleMobileMenu, showSection } from './components/ui.js';
import { renderProducts, applyFiltersAndSort, openProductModal, closeProductModal } from './components/product.js';
import { updateCartUI, addToCart, removeFromCart } from './components/cart.js';
import { openLoginModal, closeLoginModal, openRegisterModal, closeRegisterModal, handleLogin, handleRegister, handleLogout, updateUserUI } from './components/auth.js';
import { initCheckout, renderAddressList, showNewAddressForm } from './components/checkout.js';

document.addEventListener('DOMContentLoaded', () => {

    const eCommerceApp = {
        // --- ESTADO (STATE) ---
        state: {
            products: [],
            cart: [],
            addresses: [],
            currentUser: null,
            users: [
                { 
                    name: "admin", 
                    email: "adm@adm",
                    password: "adm",
                    addresses: [
                        {
                            id: 1,
                            cep: "30170-011",
                            logradouro: "Avenida Álvares Cabral",
                            numero: "123",
                            complemento: "Apto 45",
                            bairro: "Lourdes",
                            cidade: "Belo Horizonte",
                            estado: "MG"
                        }
                    ] 
                }
            ],
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
            userLogoutButton: document.getElementById('user-logout-button'),

            // --- FILTROS DE PRODUTOS ---
            searchInput: document.getElementById('search'),
            categoryFilter: document.getElementById('filter-category'),
            sortFilter: document.getElementById('sort'),

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
            elements.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
            elements.btnBackHome.addEventListener('click', () => {
                showSection(document.getElementById('home'));
            });

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
            if (this.state.currentUser.addresses && this.state.currentUser.addresses.length > 0) {
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


        handleFinalizePurchase() {
            // Lógica final de compra
            alert("Compra finalizada com sucesso! (Simulação)");
            const orderCode = `PCFY-${Date.now().toString().slice(-6)}`;
            document.getElementById('order-code').textContent = orderCode;
            showSection(this.elements.confirmationSection);
            this.state.cart = [];
            updateCartUI(this.state, this.elements);
            this.elements.checkoutForm.reset();
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
