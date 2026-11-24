# Sistema de Gestão de TCCs (Front-end)

Aplicação front-end desenvolvida em **Vue.js 3** integrada a uma API REST (Django REST Framework) para cadastro, listagem, busca, alteração de status e envio de arquivos PDF de Trabalhos de Conclusão de Curso (TCC).

Trabalho prático desenvolvido para a disciplina **GAC116 - Programação Web**, da Universidade Federal de Lavras (UFLA).

## Integrantes

- Gabriel Aguiar Alves e Silva
- Marco Antonio Maia
- Ronan Gustavo Carleto

## Tecnologias

- **Vue.js 3** (`<script setup>`) com **Vite**
- **Vue Router 4** para navegação entre telas (SPA)
- **Axios** para consumo da API REST e envio de formulários (`multipart/form-data`)
- **Bootstrap 5** e **Font Awesome** para interface responsiva e ícones

## Funcionalidades

- **Listagem e busca de entidades:** Consulta de TCCs cadastrados com filtros e busca por título, aluno, orientador ou status.
- **Cadastramento de TCCs:** Formulário integrado à API para registro de novos trabalhos.
- **Alteração de status:** Interface interativa para atualização do andamento do TCC.
- **Gestão de arquivos PDF:** Upload e visualização/download dos documentos em PDF vinculados aos trabalhos.

## Como executar localmente

### Pré-requisitos

- Node.js (v20.19+ ou v22+)
- Back-end Django REST Framework em execução localmente (padrão: `[http://127.0.0.1:8000](http://127.0.0.1:8000)`)

### Instalação e execução

```bash
git clone https://github.com/carlettoronan/gestao-tcc-vue.git
cd gestao-tcc-vue
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173/`.
