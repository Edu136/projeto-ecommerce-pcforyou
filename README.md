# Frontend - Projeto E-commerce PCForYou 🛍️

Este repositório contém o código-fonte do **frontend** para o projeto **PCForYou**, um e-commerce de peças e computadores desenvolvido com HTML, CSS e JavaScript puro. A aplicação é totalmente client-side, simulando a interação do usuário com um e-commerce completo.

Esta aplicação consome a API RESTful desenvolvida no backend do projeto para obter dados dos produtos e gerenciar outras funcionalidades.

---

## 🔗 Backend

O repositório do backend, que fornece a API para este projeto, pode ser encontrado em:
* **[https://github.com/Edu136/api-ecommerce-pcforyou]**
* Obs: O Backend ainda está em desenvolvimento

---

## ✨ Funcionalidades Principais

Este frontend implementa uma série de funcionalidades essenciais para uma experiência de e-commerce:

* **Visualização de Produtos:**
    * Listagem dinâmica de produtos a partir de um conjunto de dados.
    * Filtros por **categoria** e **nome do produto** (busca).
    * Ordenação por **preço** (menor para maior e vice-versa) e **ordem alfabética**.
    * Modal de detalhes para cada produto.

* **Carrinho de Compras:**
    * Adição e remoção de produtos no carrinho.
    * Sidebar de carrinho que atualiza em tempo real.
    * Cálculo automático do total da compra.
    * Ícone de notificação com a quantidade de itens.

* **Autenticação de Usuário (Atualmente Simulada):**
    * Modais para **Login** e **Registro** de usuários.
    * Persistência de sessão (simulada) para manter o usuário logado.
    * Interface do cabeçalho que se adapta para usuários logados e deslogados.
    * Botão de Logout.

* **Checkout Completo:**
    * Processo de checkout restrito a usuários logados.
    * **Seleção de Endereço:** Usuários podem escolher um endereço já cadastrado.
    * **Cadastro de Novo Endereço:** Formulário para adicionar um novo endereço, com integração com a API **ViaCEP** para preenchimento automático.
    * **Etapa de Pagamento (Simulada):** Resumo do pedido e botão para finalizar a compra.
    * **Tela de Confirmação:** Exibe um código de pedido gerado aleatoriamente após a finalização da compra.

* **Responsividade:**
    * Menu mobile para navegação em dispositivos menores.
    * Layout adaptável para diferentes tamanhos de tela.

---

## 🚀 Como Executar o Projeto

Como este é um projeto frontend baseado em HTML, CSS e JavaScript puros (vanilla JS), você não precisa de um servidor complexo ou de processos de build.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Edu136/projeto-ecommerce-pcforyou.git
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd projeto-ecommerce-pcforyou
    ```

3.  **Abra o arquivo `index.html` no seu navegador.**
    * Você pode simplesmente clicar duas vezes no arquivo ou, para uma melhor experiência (evitando problemas com CORS se for carregar dados externos), usar uma extensão como o **Live Server** no Visual Studio Code.

---

## 📂 Estrutura do Código (`/js`)

O código JavaScript está modularizado para facilitar a manutenção e a legibilidade.

* `main.js`: Ponto de entrada da aplicação. Orquestra todos os módulos, gerencia o estado global e vincula os eventos do DOM.
* `/components`: Módulos responsáveis por uma parte específica da UI e sua lógica.
    * `ui.js`: Funções gerais da interface, como abrir/fechar o carrinho e o menu mobile.
    * `product.js`: Funções para renderizar produtos, aplicar filtros e controlar o modal de detalhes.
    * `cart.js`: Funções para adicionar/remover itens e atualizar a UI do carrinho.
    * `auth.js`: Lógica para login, registro, logout e atualização da UI do usuário.
    * `checkout.js`: Orquestra as etapas do processo de checkout.
* `/services`: Módulos para comunicação com APIs externas.
    * `cep.js`: Função que faz a chamada para a API ViaCEP.
* `/utils`: Funções auxiliares e utilitárias.
    * `helpers.js`: Funções de validação (como `validaCep`).
* `data.js`: Arquivo com os dados mockados dos produtos (usado como fonte inicial de dados).

---
