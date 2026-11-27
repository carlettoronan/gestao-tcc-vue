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
- [x] **Upload de PDF:** Envio ou substituição do arquivo PDF em TCCs existentes.
- [x] **Cadastro de TCC:** Tela `/tccs/novo` com selects de alunos/professores e upload de PDF.
- [x] **Dashboard de Estatísticas:** Painel consumindo `/api/tccs/estatisticas/`.
- [x] **Listagens auxiliares:** Alunos, professores, cursos, departamentos e unidades acadêmicas.

---

## Como Executar o Projeto (Passo a Passo)

Para que o sistema funcione, você precisa deixar **dois terminais abertos ao mesmo tempo**: um rodando o **Back-end (Django)** na porta `8000` e outro rodando o **Front-end (Vue)** na porta `5173`.

> **Atenção:** os comandos de ativação do ambiente virtual **diferem** entre Linux/macOS e Windows. Use a seção correspondente ao seu sistema.

### Parte 1: Subir o Back-end (API)

1. Baixe ou clone o repositório do back-end (ou use a cópia em `infosDoTrabalho/projeto-gestao-tccs-main`, se existir neste projeto):

   ```bash
   git clone https://github.com/ufla-prog-web/projeto-gestao-tccs.git
   cd projeto-gestao-tccs
   ```

2. Crie o ambiente virtual:

   ```bash
   python -m venv venv
   ```

   > No Linux/Kali, se `python` não existir, use `python3 -m venv venv`.

3. Ative o ambiente virtual:

   **Linux / macOS:**

   ```bash
   source venv/bin/activate
   ```

   **Windows (PowerShell):**

   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

   **Windows (CMD):**

   ```cmd
   venv\Scripts\activate.bat
   ```

   > Com o venv ativo, o prompt costuma mostrar `(venv)` no início. Sem isso, o `pip install` pode falhar no Linux com *externally-managed-environment*.

4. Instale as dependências e prepare o banco:

   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python load.py
   ```

5. Inicie o servidor da API:

   ```bash
   python manage.py runserver
   ```

   O back-end ficará em `http://127.0.0.1:8000/api/`. **Não feche este terminal.**

---

### Parte 2: Subir o Front-end (Este Repositório)

**Pré-requisito:** Node.js versão `20.19+` ou `22+`.

1. Abra um **segundo terminal**, clone este repositório (ou entre na pasta do projeto) e instale as dependências:

   ```bash
   git clone https://github.com/carlettoronan/gestao-tcc-vue.git
   cd gestao-tcc-vue
   npm install
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

3. Abra o navegador no endereço exibido no terminal (geralmente **`http://localhost:5173/`**).

Os comandos `npm install` e `npm run dev` são iguais no Linux e no Windows.

---

### Resumo rápido

| Etapa | Linux / macOS | Windows |
|-------|---------------|---------|
| Ativar venv | `source venv/bin/activate` | `.\venv\Scripts\Activate.ps1` (PowerShell) |
| Instalar deps Django | `pip install -r requirements.txt` | igual |
| Rodar API | `python manage.py runserver` | igual |
| Rodar Vue | `npm run dev` | igual |
