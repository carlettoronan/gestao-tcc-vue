<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const tccs = ref([])
const alunosMap = ref({})
const professoresMap = ref({})
const carregando = ref(true)
const erro = ref('')

// Filtros
const busca = ref('')
const filtroStatus = ref('')
const filtroTipo = ref('')
const arquivosSelecionados = ref({})
const uploadEmAndamento = ref({})
const feedbackUpload = ref({})

const statusOpcoes = [
  { value: '0', label: 'Em Elaboração', badge: 'bg-secondary' },
  { value: '1', label: 'Enviado', badge: 'bg-info text-dark' },
  { value: '2', label: 'Aprovado', badge: 'bg-success' },
  { value: '3', label: 'Reprovado', badge: 'bg-danger' },
]

function getBadgeClass(statusCode) {
  const found = statusOpcoes.find((s) => s.value === String(statusCode))
  return found ? found.badge : 'bg-secondary'
}

async function carregarDados() {
  carregando.value = true
  erro.value = ''
  try {
    const [resTccs, resAlunos, resProfs] = await Promise.all([
      api.getTccs(busca.value),
      api.getAlunos(),
      api.getProfessores(),
    ])

    tccs.value = resTccs.data
    alunosMap.value = Object.fromEntries(resAlunos.data.map((a) => [a.id, a]))
    professoresMap.value = Object.fromEntries(resProfs.data.map((p) => [p.id, p]))
  } catch (e) {
    erro.value = 'Não foi possível conectar à API. Verifique se o back-end Django está rodando na porta 8000.'
  } finally {
    carregando.value = false
  }
}

const tccsFiltrados = computed(() => {
  return tccs.value.filter((tcc) => {
    const matchStatus = !filtroStatus.value || String(tcc.status) === filtroStatus.value
    const matchTipo = !filtroTipo.value || tcc.tipo === filtroTipo.value
    return matchStatus && matchTipo
  })
})

async function alterarStatus(tcc, novoStatus) {
  try {
    const res = await api.updateTcc(tcc.id, { status: novoStatus })
    tcc.status = res.data.status
    tcc.status_display = res.data.status_display
  } catch (e) {
    alert('Erro ao atualizar o status do TCC.')
  }
}

function selecionarArquivo(tccId, event) {
  const arquivo = event.target.files?.[0]
  if (!arquivo) return

  const nomePdf = arquivo.name.toLowerCase().endsWith('.pdf')
  const tipoValido = !arquivo.type || arquivo.type === 'application/pdf'
  if (!nomePdf || !tipoValido) {
    arquivosSelecionados.value[tccId] = null
    feedbackUpload.value[tccId] = {
      tipo: 'danger',
      mensagem: 'Selecione um arquivo PDF válido.',
    }
    event.target.value = ''
    return
  }

  arquivosSelecionados.value[tccId] = arquivo
  feedbackUpload.value[tccId] = null
}

function obterMensagemErroUpload(error) {
  const dados = error.response?.data
  if (!dados) return 'Não foi possível enviar o PDF. Verifique a conexão com a API.'
  if (typeof dados === 'string') return dados

  return Object.entries(dados)
    .map(([campo, mensagens]) => `${campo}: ${Array.isArray(mensagens) ? mensagens.join(' ') : mensagens}`)
    .join(' ')
}

async function enviarArquivo(tcc) {
  const arquivo = arquivosSelecionados.value[tcc.id]
  if (!arquivo || uploadEmAndamento.value[tcc.id]) return

  const formData = new FormData()
  formData.append('arquivo', arquivo)
  uploadEmAndamento.value[tcc.id] = true
  feedbackUpload.value[tcc.id] = null

  try {
    const resposta = await api.updateTcc(tcc.id, formData)
    tcc.arquivo = resposta.data.arquivo
    arquivosSelecionados.value[tcc.id] = null
    feedbackUpload.value[tcc.id] = {
      tipo: 'success',
      mensagem: 'PDF enviado com sucesso.',
    }
  } catch (error) {
    feedbackUpload.value[tcc.id] = {
      tipo: 'danger',
      mensagem: obterMensagemErroUpload(error),
    }
  } finally {
    uploadEmAndamento.value[tcc.id] = false
  }
}

onMounted(carregarDados)
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-0"><i class="fa-solid fa-graduation-cap me-2 text-primary"></i>Trabalhos de Conclusão de Curso</h2>
        <small class="text-muted">Listagem, busca, acompanhamento de status e documentos</small>
      </div>
      <router-link to="/tccs/novo" class="btn btn-primary">
        <i class="fa-solid fa-plus me-1"></i> Novo TCC
      </router-link>
    </div>

    <!-- Barra de Busca e Filtros -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <form @submit.prevent="carregarDados" class="row g-2 align-items-end">
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Buscar (Título ou Resumo)</label>
            <div class="input-group">
              <input
                v-model="busca"
                type="text"
                class="form-control"
                placeholder="Digite palavras-chave..."
              />
              <button class="btn btn-outline-primary" type="submit">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Status</label>
            <select v-model="filtroStatus" class="form-select">
              <option value="">Todos os status</option>
              <option v-for="st in statusOpcoes" :key="st.value" :value="st.value">
                {{ st.label }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Tipo</label>
            <select v-model="filtroTipo" class="form-select">
              <option value="">Todos os tipos</option>
              <option value="MONOGRAFIA">Monografia</option>
              <option value="RELATORIO_ESTAGIO">Relatório de Estágio</option>
              <option value="RELATORIO_TECNICO">Relatório Técnico</option>
              <option value="ARTIGO">Artigo</option>
            </select>
          </div>

          <div class="col-md-1 d-grid">
            <button
              type="button"
              class="btn btn-outline-secondary"
              title="Limpar filtros"
              @click="busca = ''; filtroStatus = ''; filtroTipo = ''; carregarDados()"
            >
              <i class="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Feedback de Erro / Carregamento -->
    <div v-if="erro" class="alert alert-danger">{{ erro }}</div>
    <div v-else-if="carregando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Carregando TCCs...</p>
    </div>

    <!-- Lista de Cards -->
    <div v-else-if="tccsFiltrados.length === 0" class="alert alert-info">
      Nenhum TCC encontrado com os filtros selecionados.
    </div>

    <div v-else class="row g-3">
      <div v-for="tcc in tccsFiltrados" :key="tcc.id" class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <span class="badge bg-light text-dark border me-2">{{ tcc.tipo_display }}</span>
                <span class="badge bg-light text-dark border me-2">{{ tcc.idioma_display }}</span>
                <span v-if="tcc.semestre_letivo_defesa" class="badge bg-light text-dark border">
                  Defesa: {{ tcc.semestre_letivo_defesa }}
                </span>
                <h5 class="card-title mt-2 mb-1">{{ tcc.titulo }}</h5>
                <p class="mb-1 text-muted small">
                  <strong>Discente:</strong> {{ alunosMap[tcc.aluno]?.nome || `ID #${tcc.aluno}` }} |
                  <strong>Orientador(a):</strong> {{ professoresMap[tcc.orientador]?.nome || `ID #${tcc.orientador}` }}
                </p>
                <p class="card-text small text-secondary mb-2">{{ tcc.resumo }}</p>
              </div>

              <!-- Alteração rápida de status -->
              <div class="text-end" style="min-width: 190px;">
                <span class="badge mb-2 d-inline-block" :class="getBadgeClass(tcc.status)">
                  {{ tcc.status_display }}
                </span>
                <select
                  :value="tcc.status"
                  @change="alterarStatus(tcc, $event.target.value)"
                  class="form-select form-select-sm"
                  aria-label="Alterar status do TCC"
                >
                  <option v-for="st in statusOpcoes" :key="st.value" :value="st.value">
                    {{ st.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
              <small class="text-muted">
                <i class="fa-solid fa-tags me-1"></i>{{ tcc.palavras_chave }}
              </small>
              <div class="d-flex gap-2">
                <a
                  v-if="tcc.arquivo"
                  :href="tcc.arquivo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-outline-danger"
                >
                  <i class="fa-solid fa-file-pdf me-1"></i> Abrir PDF
                </a>
                <span v-else class="badge bg-warning text-dark align-self-center">Sem PDF</span>
              </div>
            </div>

            <form class="row g-2 align-items-end border-top pt-3 mt-3" @submit.prevent="enviarArquivo(tcc)">
              <div class="col-md">
                <label :for="`arquivo-${tcc.id}`" class="form-label small fw-semibold">
                  {{ tcc.arquivo ? 'Substituir PDF' : 'Enviar PDF' }}
                </label>
                <input
                  :id="`arquivo-${tcc.id}`"
                  class="form-control form-control-sm"
                  type="file"
                  accept=".pdf,application/pdf"
                  :disabled="uploadEmAndamento[tcc.id]"
                  @change="selecionarArquivo(tcc.id, $event)"
                />
              </div>
              <div class="col-md-auto d-grid">
                <button
                  class="btn btn-sm btn-outline-primary"
                  type="submit"
                  :disabled="!arquivosSelecionados[tcc.id] || uploadEmAndamento[tcc.id]"
                >
                  <span
                    v-if="uploadEmAndamento[tcc.id]"
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <i v-else class="fa-solid fa-upload me-1"></i>
                  {{ uploadEmAndamento[tcc.id] ? 'Enviando...' : 'Enviar PDF' }}
                </button>
              </div>
              <div
                v-if="feedbackUpload[tcc.id]"
                class="col-12"
                :class="`text-${feedbackUpload[tcc.id].tipo}`"
                :role="feedbackUpload[tcc.id].tipo === 'danger' ? 'alert' : 'status'"
              >
                {{ feedbackUpload[tcc.id].mensagem }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>