# Sistema de Gestão de TCCs (Front-end)

Aplicação front-end desenvolvida em **Vue.js 3** integrada à API REST em Django REST Framework fornecida para a disciplina **GAC116 - Programação Web** (Universidade Federal de Lavras — UFLA).

- **Repositório do Back-end utilizado:** [`ufla-prog-web/projeto-gestao-tccs`](https://github.com/ufla-prog-web/projeto-gestao-tccs)

## Integrantes

- Gabriel Aguiar Alves e Silva
- Marco Antonio Maia
- Ronan Gustavo Carleto

## Tecnologias Utilizadas

- **Vue.js 3** (`<script setup>`) + **Vite**
- **Vue Router 4** (navegação entre telas)
- **Axios** (comunicação HTTP e upload de PDFs via `multipart/form-data`)
- **Bootstrap 5** e **Font Awesome** (layout responsivo e ícones)

## Funcionalidades Implementadas

- [x] **Listagem e busca de TCCs:** Consulta integrada à API exibindo título, resumo, palavras-chave, discente, orientador, tipo, idioma e semestre de defesa.
- [x] **Filtros dinâmicos:** Busca textual por título/resumo e filtros por status e tipo de trabalho.
- [x] **Alteração rápida de status:** Atualização direta do status (`Em Elaboração`, `Enviado`, `Aprovado`, `Reprovado`) via `PATCH` na API.
- [x] **Visualização de PDF:** Botão para abrir o arquivo PDF do TCC quando disponível.
- [ ] **Cadastro de TCC e Upload de PDF:** Tela de criação de novos trabalhos com envio de arquivo `.pdf`.
- [ ] **Dashboard de Estatísticas:** Painel visual consumindo `/api/tccs/estatisticas/`.

---

## Como Executar o Projeto (Passo a Passo)

Para que o sistema funcione, você precisa deixar **dois terminais abertos ao mesmo tempo**: um rodando o **Back-end (Django)** na porta `8000` e outro rodando o **Front-end (Vue)** na porta `5173`.

### Parte 1: Subir o Back-end (API do Professor)

1. Baixe ou clone o repositório do back-end em uma pasta separada deste projeto:

   ```bash
   git clone [https://github.com/ufla-prog-web/projeto-gestao-tccs.git](https://github.com/ufla-prog-web/projeto-gestao-tccs.git)
   cd projeto-gestao-tccs
   ```

2. Crie e ative um ambiente virtual Python, instale as dependências e crie o banco de dados:

   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   ```

3. Popule o banco de dados com os registros iniciais usando o `load.py`:

   ```powershell
   python manage.py shell -c "exec(open('load.py', encoding='utf-8').read())"
   ```

4. Inicie o servidor da API:

   ```powershell
   python manage.py runserver
   ```

   > O back-end ficará rodando em `http://127.0.0.1:8000/api/`. **Não feche este terminal.**

---

### Parte 2: Subir o Front-end (Este Repositório)

**Pré-requisito:** Ter o **Node.js** (versão `20.19+` ou `22+`) instalado na máquina.

1. Abra um **segundo terminal**, clone este repositório e entre na pasta:

   ```bash
   git clone [https://github.com/carlettoronan/gestao-tcc-vue.git](https://github.com/carlettoronan/gestao-tcc-vue.git)
   cd gestao-tcc-vue
   ```

2. Instale as dependências do projeto (isso cria a pasta `node_modules` automaticamente):

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Vue:

   ```bash
   npm run dev
   ```

4. Abra o navegador no endereço exibido no terminal (geralmente **`http://localhost:5173/`**).
