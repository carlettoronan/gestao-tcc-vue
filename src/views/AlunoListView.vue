<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

const alunos = ref([])
const cursos = ref({})
const colunas = { nome: 'Nome', matricula: 'Matrícula', curso: 'Curso' }
const campoOrdenado = ref(null)
const crescente = ref(true)
const comparador = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })
const alunosOrdenados = computed(() => {
  const campo = campoOrdenado.value
  if (!campo) return alunos.value
  const valor = aluno => campo === 'curso' ? nomeCurso(aluno) : aluno[campo]
  return [...alunos.value].sort((a, b) =>
    comparador.compare(valor(a), valor(b)) * (crescente.value ? 1 : -1)
  )
})
const porPagina = 10
const pagina = ref(1)
const totalPaginas = computed(() => Math.ceil(alunos.value.length / porPagina))
const alunosDaPagina = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return alunosOrdenados.value.slice(inicio, inicio + porPagina)
})
const busca = ref('')
const termoConsultado = ref('')
const carregando = ref(true)
const erro = ref(false)
let consultaAtual = 0

function nomeCurso(aluno) {
  return cursos.value[aluno.curso] || `Curso #${aluno.curso}`
}

function ordenar(campo) {
  crescente.value = campo !== campoOrdenado.value || !crescente.value
  campoOrdenado.value = campo
  pagina.value = 1
}

async function buscar() {
  const consulta = ++consultaAtual
  pagina.value = 1
  termoConsultado.value = busca.value.trim()
  carregando.value = true
  erro.value = false
  try {
    const { data } = await api.getAlunos(termoConsultado.value)
    if (consulta === consultaAtual) alunos.value = data
  } catch {
    if (consulta === consultaAtual) erro.value = true
  } finally {
    if (consulta === consultaAtual) carregando.value = false
  }
}

function limpar() {
  busca.value = ''
  buscar()
}

onMounted(async () => {
  buscar()
  try {
    const { data } = await api.getCursos()
    cursos.value = Object.fromEntries(data.map(curso => [curso.id, curso.nome]))
  } catch {
    // A listagem continua disponível com o identificador do curso.
  }
})
</script>

<template>
  <h1 class="h2 mb-4">Alunos</h1>
  <form class="card card-body shadow-sm mb-4" role="search" @submit.prevent="buscar">
    <label for="busca-alunos" class="form-label">Buscar por nome ou matrícula</label>
    <div class="d-flex flex-wrap gap-2">
      <input id="busca-alunos" v-model="busca" class="form-control w-auto flex-grow-1" type="search">
      <button class="btn btn-primary" type="submit">Buscar</button>
      <button class="btn btn-outline-secondary" type="button" @click="limpar">Limpar</button>
    </div>
  </form>

  <p v-if="carregando" role="status">Carregando alunos…</p>
  <div v-else-if="erro" class="alert alert-danger" role="alert">
    Não foi possível carregar os alunos.
    <button type="button" class="btn btn-link" @click="buscar">Tentar novamente</button>
  </div>
  <p v-else-if="!alunos.length" class="alert alert-info" role="status">
    {{ termoConsultado ? 'Nenhum aluno encontrado para essa busca.' : 'Nenhum aluno cadastrado.' }}
  </p>
  <div v-else class="card shadow-sm table-responsive">
    <table class="table table-striped align-middle mb-0">
      <caption class="visually-hidden">Listagem de alunos</caption>
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
        <tr v-for="aluno in alunosDaPagina" :key="aluno.id">
          <td>{{ aluno.nome }}</td>
          <td>{{ aluno.matricula }}</td>
          <td>{{ nomeCurso(aluno) }}</td>
        </tr>
      </tbody>
    </table>
    <nav v-if="totalPaginas > 1" aria-label="Paginação de alunos"
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
