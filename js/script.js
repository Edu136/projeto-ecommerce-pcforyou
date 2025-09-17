document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS ---
    // Em uma aplicação real, estes dados viriam de uma API
    const productsData = [
        {
            id: 1,
            name: "Asus Rog Strix NVIDIA RTX 4070 Ti",
            category: "notebooks",
            price: 4999.90,
            description: "Desempenho extremo para jogos em 4K e suporte a Ray Tracing e DLSS 3.",
            image: "assets/images/NBK_ASUS_ROG.jpeg",
            bestSeller: true
        },
        {
            id: 2,
            name: "Placa de Vídeo NVIDIA RTX 4070 Ti",
            category: "hardware",
            price: 4999.90,
            description: "Desempenho extremo para jogos em 4K e suporte a Ray Tracing e DLSS 3.",
            image: "assets/images/RTX_4070_TI.PNG",
            bestSeller: true
        },
        {
            id: 3,
            name: "Placa de Vídeo NVIDIA RTX 4080",
            category: "hardware",
            price: 8999.90,
            description: "Placa de vídeo de última geração para jogos e edição de vídeo em alta performance.",
            image: "assets/images/RTX_4080.png",
            bestSeller: false
        },
        {
            id: 4,
            name: "Monitor LG Ultrawide 34",
            category: "hardware",
            price: 2999.90,
            description: "Monitor ultrawide com resolução 3440x1440, ideal para produtividade e jogos.",
            image: "assets/images/LG_ULTRA_WIDE.PNG",
            bestSeller: true
        },
        {
            id: 5,
            name: "Teclado Mecânico Redragon",
            category: "perifericos",
            price: 350.00,
            description: "Teclado mecânico ABNT2 com switches Outemu Blue e iluminação RGB.",
            image: "assets/images/TECLADO.png",
            bestSeller: false
        },
        {
            id: 6,
            name: "SSD NVMe 1TB Kingston",
            category: "hardware",
            price: 599.99,
            description: "Armazenamento ultrarrápido para seu sistema operacional e jogos favoritos.",
            image: "assets/images/SSD_KINGSTON.png",
            bestSeller: true
        }
    ];

    /**
     * Objeto principal da aplicação para encapsular estado e funcionalidades.
     */
    const eCommerceApp = {
        // --- ESTADO (STATE) ---
        state: {
            products: [],
            cart: [],
            // Guarda o usuário logado. null se ninguém estiver logado.
            currentUser: null,
            // Simulação de um banco de dados de usuários
            users: [
                { name: "Usuário Teste", email: "teste@email.com", password: "123" },
                {name:"Eduardo" , email:"educorreia136@gmail.com", password:"123456"},
                {name:"admin" , email:"adm@adm" , password:"adm"}
            ],
        },

        // --- ELEMENTOS DO DOM ---
        elements: {
            checkoutUserEmail: document.getElementById('checkout-user-email'),
            userLoggedOutView: document.getElementById('user-logged-out'),
            userLoggedInView: document.getElementById('user-logged-in'),
            userLoginLink: document.getElementById('user-login-link'),
            userWelcomeMessage: document.getElementById('user-welcome-message'),
            userLogoutButton: document.getElementById('user-logout-button'),
            registerErrorMessage: document.getElementById('register-error-message'),
            loginErrorMessage: document.getElementById('login-error-message'),
            productList: document.getElementById('product-list'),
            productModal: document.getElementById('product-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalImage: document.getElementById('modal-image'),
            modalDesc: document.getElementById('modal-desc'),
            modalPrice: document.getElementById('modal-price'),
            modalAddCart: document.getElementById('modal-add-cart'),
            modalClose: document.getElementById('modal-close'),
            btnOpenCart: document.getElementById('btn-open-cart'),
            cartSidebar: document.getElementById('cart'),
            cartClose: document.getElementById('cart-close'),
            cartItems: document.getElementById('cart-items'),
            cartTotal: document.getElementById('cart-total'),
            cartCount: document.getElementById('cart-count'),
            cartFooter: document.getElementById('cart-footer'),
            cartEmptyMessage: document.getElementById('cart-empty-message'),
            btnCheckout: document.getElementById('btn-checkout'),
            checkoutSection: document.getElementById('checkout-section'),
            checkoutForm: document.getElementById('checkout-form'),
            confirmationSection: document.getElementById('confirmation'),
            btnBackHome: document.getElementById('btn-back-home'),
            mainSections: document.querySelectorAll('main > section:not(#checkout-section):not(#confirmation)'),
            searchInput: document.getElementById('search'),
            categoryFilter: document.getElementById('filter-category'),
            sortFilter: document.getElementById('sort'),
            btnMenu: document.getElementById('btn-menu'),
            mobileMenu: document.getElementById('mobile-menu'),
            navCartLink: document.getElementById('nav-cart-link'),
            mobileNavCartLink: document.getElementById('mobile-nav-cart-link'),
            userAccountLink: document.querySelector('a[href="#login"]'),
            loginModal: document.getElementById('login-modal'),
            loginModalClose: document.getElementById('login-modal-close'),
            loginForm: document.getElementById('login-form'),
            registerModal: document.getElementById('register-modal'),
            registerModalClose: document.getElementById('register-modal-close'),
            registerForm: document.getElementById('register-form'),
            showRegisterModalBtn: document.getElementById('show-register-modal'),
            showLoginModalBtn: document.getElementById('show-login-modal'),
            checkoutUserName: document.getElementById('checkout-user-name'),
            checkoutUserEmail: document.getElementById('checkout-user-email'),
        },

        /**
         * Inicializa a aplicação.
         */
        init(products) {
            this.state.products = products;
            this.bindEvents();
            this.applyFiltersAndSort();
            this.updateCartUI();
            this.updateUserUI(); // Atualiza a UI do usuário na inicialização
        },

        /**
         * Vincula todos os event listeners necessários.
         */
        bindEvents() {
            // Filtros e Ordenação
            this.elements.searchInput.addEventListener('input', this.applyFiltersAndSort.bind(this));
            this.elements.categoryFilter.addEventListener('change', this.applyFiltersAndSort.bind(this));
            this.elements.sortFilter.addEventListener('change', this.applyFiltersAndSort.bind(this));

            // Ações de Produtos (Delegação de Eventos)
            this.elements.productList.addEventListener('click', this.handleProductActions.bind(this));

            // Modal de Produto
            this.elements.modalClose.addEventListener('click', this.closeModal.bind(this));
            this.elements.productModal.addEventListener('click', (e) => {
                if (e.target === this.elements.productModal) this.closeModal();
            });
            this.elements.modalAddCart.addEventListener('click', (e) => {
                this.addToCart(e.target.dataset.id);
                this.closeModal();
            });

            // Carrinho
            this.elements.btnOpenCart.addEventListener('click', this.openCart.bind(this));
            this.elements.navCartLink.addEventListener('click', this.openCart.bind(this));
            this.elements.cartClose.addEventListener('click', this.closeCart.bind(this));
            this.elements.cartItems.addEventListener('click', this.handleCartActions.bind(this));

            // Checkout (LÓGICA MODIFICADA)
            this.elements.btnCheckout.addEventListener('click', this.handleCheckoutAttempt.bind(this));
            this.elements.checkoutForm.addEventListener('submit', this.handleCheckoutSubmit.bind(this));
            
            // Confirmação e Voltar
            this.elements.btnBackHome.addEventListener('click', this.goBackHome.bind(this));

            // Menu Mobile
            this.elements.btnMenu.addEventListener('click', this.toggleMobileMenu.bind(this));
            this.elements.mobileNavCartLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.elements.mobileMenu.classList.add('hidden');
                this.openCart();
            });


            this.elements.loginModalClose.addEventListener('click', this.closeLoginModal.bind(this));
            this.elements.registerModalClose.addEventListener('click', this.closeRegisterModal.bind(this));

            this.elements.showRegisterModalBtn.addEventListener('click', () => {
                this.closeLoginModal();
                this.openRegisterModal();
            });
            this.elements.showLoginModalBtn.addEventListener('click', () => {
                this.closeRegisterModal();
                this.openLoginModal();
            });

            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.elements.registerForm.addEventListener('submit', this.handleRegister.bind(this));

            this.elements.userLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLoginModal();
            });

            this.elements.userLogoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        },

        // --- LÓGICA DE AUTENTICAÇÃO ---

        openLoginModal() { this.elements.loginModal.classList.remove('hidden'); },
        closeLoginModal() { this.elements.loginModal.classList.add('hidden'); this.elements.loginForm.reset(); },
        openRegisterModal() { this.elements.registerModal.classList.remove('hidden'); },
        closeRegisterModal() { this.elements.registerModal.classList.add('hidden'); this.elements.registerForm.reset(); },

        handleLogin(event) {
            event.preventDefault();
            document.getElementById('login-error-message').classList.add('hidden');
            const email = this.elements.loginForm.querySelector('#login-email').value;
            const password = this.elements.loginForm.querySelector('#login-password').value;

            const user = this.state.users.find(u => u.email === email && u.password === password);

            if (user) {
                this.state.currentUser = user;
                this.updateUserUI();
                this.closeLoginModal();
                this.handleCheckoutAttempt();
                this.elements.logout.classList.remove('hidden'); //Mostra o link de logout
            } else {
                this.elements.loginErrorMessage.classList.remove('hidden');
                setTimeout(() => {
                    this.elements.loginErrorMessage.classList.add('hidden');
                }, 5123000);
            }
        },

        handleRegister(event) {
            event.preventDefault();
            this.elements.registerErrorMessage.innerHTML = '';
            this.elements.registerErrorMessage.classList.add('hidden');
            const name = this.elements.registerForm.querySelector('#register-name').value;
            const email = this.elements.registerForm.querySelector('#register-email').value;
            const password = this.elements.registerForm.querySelector('#register-password').value;

            if (this.state.users.some(u => u.email === email)) {
                this.elements.registerErrorMessage.classList.remove('hidden');
                this.elements.registerErrorMessage.innerHTML = 'Este e-mail já está em uso. <br> Por favor, use outro e-mail ou faça login.';

                setTimeout(() => {
                    this.elements.registerErrorMessage.classList.add('hidden');
                }, 5000);
                return;
            }

            const newUser = { name, email, password };
            this.state.users.push(newUser);
            this.state.currentUser = newUser;

            alert('Cadastro realizado com sucesso! Você já está logado.');
            this.updateUserUI();
            this.closeRegisterModal();
            this.handleCheckoutAttempt(); // Tenta ir para o checkout após o cadastro
        },

        handleLogout() {
            this.state.currentUser = null;
            this.updateUserUI();
        },
        
        updateUserUI() {
            const isLoggedIn = !!this.state.currentUser; // true se o usuário existir, false se for null

            if (isLoggedIn) {
                // Mostra a saudação e esconde o ícone de login
                this.elements.userLoggedInView.classList.remove('hidden');
                this.elements.userLoggedInView.classList.add('flex'); // Garante o alinhamento
                this.elements.userLoggedOutView.classList.add('hidden');

                // Define a mensagem de boas-vindas
                const firstName = this.state.currentUser.name.split(' ')[0];
                this.elements.userWelcomeMessage.textContent = `Olá, ${firstName}`;
            } else {
                // Mostra o ícone de login e esconde a saudação
                this.elements.userLoggedOutView.classList.remove('hidden');
                this.elements.userLoggedInView.classList.add('hidden');
                this.elements.userLoggedInView.classList.remove('flex');
            }
        },

        // --- LÓGICA DE CHECKOUT ---

        handleCheckoutAttempt() {
            if (this.state.cart.length === 0) {
                alert("Login realizado com sucesso! Adicione itens ao carrinho para continuar.");
                return;
            }

            if (this.state.currentUser) {
                this.showCheckout();
            } else {
                alert("Por favor, faça login ou cadastre-se para continuar.");
                this.openLoginModal();
            }
        },
        
        showCheckout() {
            this.closeCart();
            this.elements.checkoutUserName.textContent = this.state.currentUser.name;
            this.elements.checkoutUserEmail.textContent = this.state.currentUser.email;
            this.showSection(this.elements.checkoutSection);
        },
        
        handleCheckoutSubmit(event) {
            event.preventDefault();
            const orderCode = `PCFY-${Date.now().toString().slice(-6)}`;
            document.getElementById('order-code').textContent = orderCode;
            this.showSection(this.elements.confirmationSection);
            this.state.cart = [];
            this.updateCartUI();
            this.elements.checkoutForm.reset();
        },

        // --- MÉTODOS DE RENDERIZAÇÃO E UI ---

        renderProducts(productsToRender) {
            if (productsToRender.length === 0) {
                this.elements.productList.innerHTML = '<p class="col-span-full text-center text-gray-500">Nenhum produto encontrado.</p>';
                return;
            }
            const productsHTML = productsToRender.map(product => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 w min-h-[380px] flex flex-col">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-lg font-semibold text-blue-900">${product.name}</h3>
                        <p class="text-gray-600 mt-2">${this.formatCurrency(product.price)}</p>
                        <div class="mt-auto pt-4">
                            <button data-id="${product.id}" data-action="details" class="details-btn w-full bg-blue-100 text-blue-800 font-semibold py-2 rounded hover:bg-blue-200 transition">
                                Ver Detalhes
                            </button>
                            <button class="add-to-cart-btn mt-2 w-full bg-green-900 text-white font-semibold py-2 rounded hover:bg-green-600 transition" data-id="${product.id}" data-action="add">
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            this.elements.productList.innerHTML = productsHTML;
        },

        updateCartUI() {
            const { cart } = this.state;
            const { cartItems, cartTotal, cartCount, cartEmptyMessage, cartFooter, btnCheckout } = this.elements;
            
            cartItems.innerHTML = ''; // Limpa o carrinho antes de atualizar
            if (cart.length === 0) {
                cartEmptyMessage.classList.remove('hidden');
                cartFooter.classList.add('hidden');
            } else {
                cartEmptyMessage.classList.add('hidden');
                cartFooter.classList.remove('hidden');
                cartItems.innerHTML = cart.map(item => `
                    <li class="flex items-center justify-between gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                        <div class="flex-grow">
                            <p class="font-semibold">${item.name}</p>
                            <p class="text-sm text-gray-600">${this.formatCurrency(item.price)} x ${item.quantity}</p>
                        </div>
                        <button data-id="${item.id}" data-action="remove" class="remove-btn text-red-500 hover:text-red-700 font-bold">&times;</button>
                    </li>
                `).join('');
            }
            
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

            cartTotal.textContent = this.formatCurrency(total);
            cartCount.textContent = totalItems;
            btnCheckout.disabled = cart.length === 0;
        },

        applyFiltersAndSort() {
            let filteredProducts = [...this.state.products];
            const searchTerm = this.elements.searchInput.value.toLowerCase();
            const category = this.elements.categoryFilter.value;
            const sortBy = this.elements.sortFilter.value;

            if (searchTerm) {
                filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
            }
            if (category) {
                filteredProducts = filteredProducts.filter(p => p.category === category);
            }
            switch (sortBy) {
                case 'price-asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'best-sellers':
                    filteredProducts.sort((a, b) => b.bestSeller - a.bestSeller);
                    break;
            }
            this.renderProducts(filteredProducts);
        },

        handleProductActions(event) {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const { id, action } = button.dataset;
            if (action === 'details') this.openModal(id);
            else if (action === 'add') this.addToCart(id);
        },
        
        handleCartActions(event) {
            const button = event.target.closest('button[data-action="remove"]');
            if (button) this.removeFromCart(button.dataset.id);
        },
        
        // --- LÓGICA DO CARRINHO ---
        
        addToCart(productId) {
            const productInCart = this.state.cart.find(item => item.id == productId);
            if (productInCart) {
                productInCart.quantity++;
            } else {
                const product = this.state.products.find(p => p.id == productId);
                this.state.cart.push({ ...product, quantity: 1 });
            }
            this.updateCartUI();
            this.openCart();
        },
        
        removeFromCart(productId) {
            this.state.cart = this.state.cart.filter(item => item.id != productId);
            this.updateCartUI();
        },

        // --- CONTROLES DE UI E NAVEGAÇÃO ---
        
        openModal(productId) {
            const product = this.state.products.find(p => p.id == productId);
            this.elements.modalTitle.textContent = product.name;
            this.elements.modalImage.src = product.image;
            this.elements.modalImage.alt = product.name;
            this.elements.modalDesc.textContent = product.description;
            this.elements.modalPrice.textContent = this.formatCurrency(product.price);
            this.elements.modalAddCart.dataset.id = product.id;
            this.elements.productModal.classList.remove('hidden');
        },
        closeModal() { this.elements.productModal.classList.add('hidden'); },
        openCart() { this.elements.cartSidebar.classList.remove('translate-x-full'); },
        closeCart() { this.elements.cartSidebar.classList.add('translate-x-full'); },
        
        goBackHome() {
            this.showSection(document.getElementById('home')); 
            // Volta para a home e re-exibe as seções principais
             mainSections.forEach(sec => sec.classList.remove('hidden'));
        },
        
        toggleMobileMenu() {
            this.elements.mobileMenu.classList.toggle('hidden');
            const isExpanded = this.elements.btnMenu.getAttribute('aria-expanded') === 'true';
            this.elements.btnMenu.setAttribute('aria-expanded', !isExpanded);
        },

        showSection(sectionToShow) {
            document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
            sectionToShow.classList.remove('hidden');
            window.scrollTo(0, 0);
        },

        // --- MÉTODOS UTILITÁRIOS ---

        formatCurrency(value) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },
    };

    // --- INICIALIZAÇÃO ---
    eCommerceApp.init(productsData);
});