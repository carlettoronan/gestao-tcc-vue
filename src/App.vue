<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to="/">
          <i class="fa-solid fa-book-open-reader me-2"></i>Gestão de TCCs — UFLA
        </router-link>
        <div class="navbar-nav ms-auto">
          <router-link class="nav-link" to="/">TCCs</router-link>
          <router-link class="nav-link" to="/alunos">Alunos</router-link>
          <router-link class="nav-link" to="/professores">Professores</router-link>
          <router-link class="nav-link" to="/tccs/novo">Cadastrar TCC</router-link>
        </div>
      </div>
    </nav>

    <main class="container pb-5">
      <router-view />
    </main>
  </div>
</template>
