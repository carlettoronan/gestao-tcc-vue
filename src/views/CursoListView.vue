<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

const cursos = ref([])
const busca = ref('')
const termoConsultado = ref('')
const carregando = ref(true)
const erro = ref(false)
const colunas = { nome: 'Nome', sigla: 'Sigla', codigo: 'Código' }
const campoOrdenado = ref(null)
const crescente = ref(true)
const pagina = ref(1)
const porPagina = 10
const comparador = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

function normalizar(valor) {
  return String(valor).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

const cursosFiltrados = computed(() => {
  const termo = normalizar(termoConsultado.value)
  if (!termo) return cursos.value
  return cursos.value.filter(curso =>
    Object.keys(colunas).some(campo => normalizar(curso[campo]).includes(termo))
  )
})

const cursosOrdenados = computed(() => {
  const campo = campoOrdenado.value
  if (!campo) return cursosFiltrados.value
  return [...cursosFiltrados.value].sort((a, b) =>
    comparador.compare(a[campo], b[campo]) * (crescente.value ? 1 : -1)
  )
})

const totalPaginas = computed(() => Math.ceil(cursosFiltrados.value.length / porPagina))
const cursosDaPagina = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return cursosOrdenados.value.slice(inicio, inicio + porPagina)
})

function ordenar(campo) {
  crescente.value = campo !== campoOrdenado.value || !crescente.value
  campoOrdenado.value = campo
  pagina.value = 1
}

function buscar() {
  termoConsultado.value = busca.value.trim()
  pagina.value = 1
}

function limpar() {
  busca.value = ''
  buscar()
}

async function carregar() {
  carregando.value = true
  erro.value = false
  try {
    const { data } = await api.getCursos()
    cursos.value = data
  } catch {
    erro.value = true
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <h1 class="h2 mb-4">Cursos</h1>
  <form class="card card-body shadow-sm mb-4" role="search" @submit.prevent="buscar">
    <label for="busca-cursos" class="form-label">Buscar por nome, sigla ou código</label>
    <div class="d-flex flex-wrap gap-2">
      <input id="busca-cursos" v-model="busca" class="form-control w-auto flex-grow-1" type="search">
      <button class="btn btn-primary" type="submit">Buscar</button>
      <button class="btn btn-outline-secondary" type="button" @click="limpar">Limpar</button>
    </div>
  </form>

  <p v-if="carregando" role="status">Carregando cursos…</p>
  <div v-else-if="erro" class="alert alert-danger" role="alert">
    Não foi possível carregar os cursos.
    <button type="button" class="btn btn-link" @click="carregar">Tentar novamente</button>
  </div>
  <p v-else-if="!cursosFiltrados.length" class="alert alert-info" role="status">
    {{ termoConsultado ? 'Nenhum curso encontrado para essa busca.' : 'Nenhum curso cadastrado.' }}
  </p>
  <div v-else class="card shadow-sm table-responsive">
    <table class="table table-striped align-middle mb-0">
      <caption class="visually-hidden">Listagem de cursos</caption>
      <thead>
        <tr>
          <th v-for="(titulo, campo) in colunas" :key="campo" scope="col"
            :aria-sort="campo === campoOrdenado ? (crescente ? 'ascending' : 'descending') : undefined">
            <button type="button" class="btn btn-link text-body fw-bold text-decoration-none p-0"
              :aria-label="`Ordenar por ${titulo}`" @click="ordenar(campo)">
              {{ titulo }}
              <span aria-hidden="true">{{ campo === campoOrdenado ? (crescente ? '↑' : '↓') : '↕' }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curso in cursosDaPagina" :key="curso.id">
          <td>{{ curso.nome }}</td>
          <td>{{ curso.sigla }}</td>
          <td>{{ curso.codigo }}</td>
        </tr>
      </tbody>
    </table>
    <nav v-if="totalPaginas > 1" aria-label="Paginação de cursos"
      class="d-flex align-items-center justify-content-center flex-wrap gap-3 p-3">
      <button type="button" class="btn btn-sm btn-outline-primary" :disabled="pagina === 1" @click="pagina--">
        Anterior
      </button>
      <span role="status">Página {{ pagina }} de {{ totalPaginas }}</span>
      <button type="button" class="btn btn-sm btn-outline-primary" :disabled="pagina === totalPaginas" @click="pagina++">
        Próxima
      </button>
    </nav>
  </div>
</template>
