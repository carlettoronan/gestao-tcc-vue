<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const alunos = ref([])
const professores = ref([])
const carregandoOpcoes = ref(true)
const enviando = ref(false)
const erroCarregar = ref('')
const erroFormulario = ref('')
const sucesso = ref('')

const form = reactive({
  titulo: '',
  resumo: '',
  palavras_chave: '',
  tipo: '',
  idioma: 'PT',
  aluno: '',
  orientador: '',
  coorientador: '',
  presidente: '',
  primeiro_membro: '',
  segundo_membro: '',
  semestre_letivo_defesa: '',
  status: '0',
})

const arquivo = ref(null)
const inputArquivo = ref(null)

const tipos = [
  { value: 'MONOGRAFIA', label: 'Monografia' },
  { value: 'RELATORIO_ESTAGIO', label: 'Relatório de Estágio' },
  { value: 'RELATORIO_TECNICO', label: 'Relatório Técnico' },
  { value: 'ARTIGO', label: 'Artigo' },
]

const idiomas = [
  { value: 'PT', label: 'Português' },
  { value: 'EN', label: 'Inglês' },
]

const statusOpcoes = [
  { value: '0', label: 'Em Elaboração' },
  { value: '1', label: 'Enviado' },
  { value: '2', label: 'Aprovado' },
  { value: '3', label: 'Reprovado' },
]

const semestres = [
  '2020/1', '2020/2',
  '2021/1', '2021/2',
  '2022/1', '2022/2',
  '2023/1', '2023/2',
  '2024/1', '2024/2',
  '2025/1', '2025/2',
  '2026/1',
]

function rotuloAluno(aluno) {
  return `${aluno.nome} (${aluno.matricula})`
}

function rotuloProfessor(professor) {
  return professor.nome
}

function selecionarArquivo(event) {
  const file = event.target.files?.[0]
  if (!file) {
    arquivo.value = null
    return
  }

  const nomePdf = file.name.toLowerCase().endsWith('.pdf')
  const tipoValido = !file.type || file.type === 'application/pdf'
  if (!nomePdf || !tipoValido) {
    arquivo.value = null
    if (inputArquivo.value) inputArquivo.value.value = ''
    erroFormulario.value = 'Selecione um arquivo PDF válido.'
    return
  }

  erroFormulario.value = ''
  arquivo.value = file
}

function obterMensagemErro(error) {
  const dados = error.response?.data
  if (!dados) return 'Não foi possível cadastrar o TCC. Verifique a conexão com a API.'
  if (typeof dados === 'string') return dados
  if (dados.detail) return dados.detail

  return Object.entries(dados)
    .map(([campo, mensagens]) => `${campo}: ${Array.isArray(mensagens) ? mensagens.join(' ') : mensagens}`)
    .join(' ')
}

async function carregarOpcoes() {
  carregandoOpcoes.value = true
  erroCarregar.value = ''
  try {
    const [resAlunos, resProfs] = await Promise.all([
      api.getAlunos(),
      api.getProfessores(),
    ])
    alunos.value = resAlunos.data
    professores.value = resProfs.data
  } catch {
    erroCarregar.value = 'Não foi possível carregar alunos e professores. Verifique se a API está rodando na porta 8000.'
  } finally {
    carregandoOpcoes.value = false
  }
}

async function salvar() {
  if (enviando.value) return

  erroFormulario.value = ''
  sucesso.value = ''

  const obrigatorios = [
    ['titulo', 'Título'],
    ['resumo', 'Resumo'],
    ['palavras_chave', 'Palavras-chave'],
    ['tipo', 'Tipo'],
    ['idioma', 'Idioma'],
    ['aluno', 'Aluno'],
    ['orientador', 'Orientador'],
    ['presidente', 'Presidente da banca'],
    ['primeiro_membro', 'Primeiro membro'],
    ['segundo_membro', 'Segundo membro'],
  ]

  for (const [campo, label] of obrigatorios) {
    if (!String(form[campo] ?? '').trim()) {
      erroFormulario.value = `Preencha o campo obrigatório: ${label}.`
      return
    }
  }

  const formData = new FormData()
  formData.append('titulo', form.titulo.trim())
  formData.append('resumo', form.resumo.trim())
  formData.append('palavras_chave', form.palavras_chave.trim())
  formData.append('tipo', form.tipo)
  formData.append('idioma', form.idioma)
  formData.append('aluno', form.aluno)
  formData.append('orientador', form.orientador)
  formData.append('presidente', form.presidente)
  formData.append('primeiro_membro', form.primeiro_membro)
  formData.append('segundo_membro', form.segundo_membro)
  formData.append('status', form.status)

  if (form.coorientador) {
    formData.append('coorientador', form.coorientador)
  }
  if (form.semestre_letivo_defesa) {
    formData.append('semestre_letivo_defesa', form.semestre_letivo_defesa)
  }
  if (arquivo.value) {
    formData.append('arquivo', arquivo.value)
  }

  enviando.value = true
  try {
    await api.createTcc(formData)
    sucesso.value = 'TCC cadastrado com sucesso.'
    setTimeout(() => router.push('/'), 900)
  } catch (error) {
    erroFormulario.value = obterMensagemErro(error)
  } finally {
    enviando.value = false
  }
}

onMounted(carregarOpcoes)
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h2 class="mb-0">
          <i class="fa-solid fa-file-circle-plus me-2 text-primary"></i>Cadastrar TCC
        </h2>
        <small class="text-muted">Preencha os dados do trabalho e, se quiser, anexe o PDF</small>
      </div>
      <router-link to="/" class="btn btn-outline-secondary">
        <i class="fa-solid fa-arrow-left me-1"></i> Voltar à listagem
      </router-link>
    </div>

    <div v-if="erroCarregar" class="alert alert-danger">{{ erroCarregar }}</div>

    <div v-else-if="carregandoOpcoes" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Carregando opções do formulário...</p>
    </div>

    <form v-else class="card shadow-sm" @submit.prevent="salvar">
      <div class="card-body">
        <div v-if="sucesso" class="alert alert-success" role="status">{{ sucesso }}</div>
        <div v-if="erroFormulario" class="alert alert-danger" role="alert">{{ erroFormulario }}</div>

        <h5 class="mb-3">Dados do trabalho</h5>
        <div class="row g-3 mb-4">
          <div class="col-12">
            <label for="titulo" class="form-label fw-semibold">Título <span class="text-danger">*</span></label>
            <input id="titulo" v-model="form.titulo" type="text" class="form-control" maxlength="255" required />
          </div>

          <div class="col-12">
            <label for="resumo" class="form-label fw-semibold">Resumo <span class="text-danger">*</span></label>
            <textarea id="resumo" v-model="form.resumo" class="form-control" rows="4" required></textarea>
          </div>

          <div class="col-md-6">
            <label for="palavras_chave" class="form-label fw-semibold">
              Palavras-chave <span class="text-danger">*</span>
            </label>
            <input
              id="palavras_chave"
              v-model="form.palavras_chave"
              type="text"
              class="form-control"
              placeholder="Separe por vírgula"
              maxlength="255"
              required
            />
          </div>

          <div class="col-md-3">
            <label for="tipo" class="form-label fw-semibold">Tipo <span class="text-danger">*</span></label>
            <select id="tipo" v-model="form.tipo" class="form-select" required>
              <option value="" disabled>Selecione...</option>
              <option v-for="t in tipos" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>

          <div class="col-md-3">
            <label for="idioma" class="form-label fw-semibold">Idioma <span class="text-danger">*</span></label>
            <select id="idioma" v-model="form.idioma" class="form-select" required>
              <option v-for="i in idiomas" :key="i.value" :value="i.value">{{ i.label }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="semestre" class="form-label fw-semibold">Semestre letivo da defesa</label>
            <select id="semestre" v-model="form.semestre_letivo_defesa" class="form-select">
              <option value="">Não informado</option>
              <option v-for="s in semestres" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="status" class="form-label fw-semibold">Status</label>
            <select id="status" v-model="form.status" class="form-select">
              <option v-for="st in statusOpcoes" :key="st.value" :value="st.value">{{ st.label }}</option>
            </select>
          </div>
        </div>

        <h5 class="mb-3">Pessoas envolvidas</h5>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label for="aluno" class="form-label fw-semibold">Aluno <span class="text-danger">*</span></label>
            <select id="aluno" v-model="form.aluno" class="form-select" required>
              <option value="" disabled>Selecione o discente...</option>
              <option v-for="a in alunos" :key="a.id" :value="a.id">{{ rotuloAluno(a) }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="orientador" class="form-label fw-semibold">Orientador <span class="text-danger">*</span></label>
            <select id="orientador" v-model="form.orientador" class="form-select" required>
              <option value="" disabled>Selecione o orientador...</option>
              <option v-for="p in professores" :key="p.id" :value="p.id">{{ rotuloProfessor(p) }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="coorientador" class="form-label fw-semibold">Coorientador</label>
            <select id="coorientador" v-model="form.coorientador" class="form-select">
              <option value="">Nenhum</option>
              <option v-for="p in professores" :key="`co-${p.id}`" :value="p.id">{{ rotuloProfessor(p) }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="presidente" class="form-label fw-semibold">
              Presidente da banca <span class="text-danger">*</span>
            </label>
            <select id="presidente" v-model="form.presidente" class="form-select" required>
              <option value="" disabled>Selecione...</option>
              <option v-for="p in professores" :key="`pres-${p.id}`" :value="p.id">{{ rotuloProfessor(p) }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="primeiro_membro" class="form-label fw-semibold">
              Primeiro membro <span class="text-danger">*</span>
            </label>
            <select id="primeiro_membro" v-model="form.primeiro_membro" class="form-select" required>
              <option value="" disabled>Selecione...</option>
              <option v-for="p in professores" :key="`m1-${p.id}`" :value="p.id">{{ rotuloProfessor(p) }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="segundo_membro" class="form-label fw-semibold">
              Segundo membro <span class="text-danger">*</span>
            </label>
            <select id="segundo_membro" v-model="form.segundo_membro" class="form-select" required>
              <option value="" disabled>Selecione...</option>
              <option v-for="p in professores" :key="`m2-${p.id}`" :value="p.id">{{ rotuloProfessor(p) }}</option>
            </select>
          </div>
        </div>

        <h5 class="mb-3">Documento PDF</h5>
        <div class="mb-4">
          <label for="arquivo" class="form-label fw-semibold">Arquivo do TCC (PDF)</label>
          <input
            id="arquivo"
            ref="inputArquivo"
            class="form-control"
            type="file"
            accept=".pdf,application/pdf"
            :disabled="enviando"
            @change="selecionarArquivo"
          />
          <div class="form-text">
            Opcional no cadastro; também é possível enviar ou substituir o PDF depois na listagem.
          </div>
          <div v-if="arquivo" class="small text-success mt-1">
            <i class="fa-solid fa-file-pdf me-1"></i>{{ arquivo.name }}
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 justify-content-end border-top pt-3">
          <router-link to="/" class="btn btn-outline-secondary" :class="{ disabled: enviando }">
            Cancelar
          </router-link>
          <button class="btn btn-primary" type="submit" :disabled="enviando">
            <span
              v-if="enviando"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <i v-else class="fa-solid fa-floppy-disk me-1"></i>
            {{ enviando ? 'Salvando...' : 'Cadastrar TCC' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
