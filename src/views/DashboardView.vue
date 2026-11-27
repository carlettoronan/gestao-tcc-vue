<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../services/api'

const dados = ref(null)
const erro = ref(false)
const carregando = ref(true)
const cores = ['#165fa5', '#07917d', '#d88a17', '#94579a']
const percentual = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
const fatias = computed(() => Object.entries(dados.value?.por_status ?? {}).map(([nome, total], i) => ({
  nome, total, cor: cores[i % cores.length], fracao: total / dados.value.total_geral,
})))
const fundoPizza = computed(() => {
  let fim = 0
  const partes = fatias.value.map(({ cor, fracao }) => {
    const inicio = fim
    fim += fracao * 100
    return cor + ' ' + inicio + '% ' + fim + '%'
  })
  return partes.length ? 'conic-gradient(' + partes.join(', ') + ')' : '#dee2e6'
})

function abrirFatia(evento) {
  const caixa = evento.currentTarget.getBoundingClientRect()
  const x = evento.clientX - caixa.left - caixa.width / 2
  const y = evento.clientY - caixa.top - caixa.height / 2
  // O gradiente começa no topo e avança no sentido horário.
  const volta = (Math.atan2(x, -y) / (2 * Math.PI) + 1) % 1
  let limite = 0
  const indice = fatias.value.findIndex(fatia => {
    limite += fatia.fracao
    return volta < limite
  })
  if (indice >= 0) abrirDetalhe(document.getElementById('detalhe-status-' + indice), evento.clientX, evento.clientY, evento.clientY)
}

function abrirDetalheDoBotao(evento) {
  const caixa = evento.currentTarget.getBoundingClientRect()
  abrirDetalhe(evento.currentTarget.popoverTargetElement, caixa.left, caixa.top, caixa.bottom)
}

function abrirDetalhe(popup, x, topo, base) {
  popup.showPopover()
  const margem = 8
  const tela = document.documentElement
  const caixa = popup.getBoundingClientRect()
  const esquerda = Math.min(x + margem, tela.clientWidth - caixa.width - margem)
  const abaixo = base + margem
  const cabeAbaixo = abaixo + caixa.height <= tela.clientHeight - margem
  popup.style.left = Math.max(margem, esquerda) + 'px'
  popup.style.top = Math.max(margem, cabeAbaixo ? abaixo : topo - caixa.height - margem) + 'px'
}

const inicio = ref('')
const fim = ref('')
const trabalhos = ref([])
const erroSemestres = ref(false)
const carregandoSemestres = ref(true)
async function carregarSemestres() {
  carregandoSemestres.value = true
  erroSemestres.value = false
  try {
    trabalhos.value = (await api.getTccs()).data
  } catch {
    erroSemestres.value = true
  } finally {
    carregandoSemestres.value = false
  }
}
const contagens = computed(() => {
  const porSemestre = new Map()
  for (const { semestre_letivo_defesa: semestre, status_display: status } of trabalhos.value) {
    if (!semestre) continue
    if (!porSemestre.has(semestre)) porSemestre.set(semestre, new Map())
    const porStatus = porSemestre.get(semestre)
    porStatus.set(status, (porStatus.get(status) ?? 0) + 1)
  }
  return porSemestre
})
const semestres = computed(() => Array.from(contagens.value, ([s, porStatus]) =>
  [s, Array.from(porStatus.values()).reduce((a, b) => a + b, 0)]
).sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true })))
const legendaSemestres = computed(() => {
  const coresStatus = new Map(fatias.value.map(f => [f.nome, f.cor]))
  for (const porStatus of contagens.value.values()) {
    for (const nome of porStatus.keys()) {
      if (!coresStatus.has(nome)) coresStatus.set(nome, cores[coresStatus.size % cores.length])
    }
  }
  return coresStatus
})
const coorientacao = computed(() => {
  const total = dados.value.total_geral
  const com = Object.values(dados.value.por_coorientador).reduce((soma, n) => soma + n, 0)
  return [
    { id: 'com', nome: 'Com coorientador', total: com, cor: '#087e70' },
    { id: 'sem', nome: 'Sem coorientador', total: total - com, cor: '#586982' },
  ]
})
const periodo = computed(() => semestres.value.filter(([s]) =>
  (!inicio.value || s >= inicio.value) && (!fim.value || s <= fim.value)))
const picoSemestre = computed(() => Math.max(1, ...periodo.value.map(([, total]) => total)))

const grupos = {
  por_orientador: 'Orientador', por_coorientador: 'Coorientador', por_curso: 'Curso',
  por_departamento: 'Departamento', por_unidade_academica: 'Unidade acadêmica',
  por_tipo: 'Tipo de trabalho', por_idioma: 'Idioma',
}
const grupo = ref('por_orientador')
const busca = ref('')
const pagina = ref(1)
const porPagina = 8
const normalizar = texto => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const ranking = computed(() => Object.entries(dados.value?.[grupo.value] ?? {})
  .sort(([a, x], [b, y]) => y - x || a.localeCompare(b, 'pt-BR')))
const resultados = computed(() => {
  const termo = normalizar(busca.value.trim())
  return ranking.value.filter(([nome]) => normalizar(nome).includes(termo))
})
const paginas = computed(() => Math.ceil(resultados.value.length / porPagina))
const linhas = computed(() => resultados.value.slice((pagina.value - 1) * porPagina, pagina.value * porPagina))
watch(grupo, () => { busca.value = ''; pagina.value = 1 })
watch(busca, () => { pagina.value = 1 })

async function carregar() {
  carregando.value = true
  erro.value = false
  try {
    dados.value = (await api.getEstatisticas()).data
    if (dados.value.total_geral) carregarSemestres()
  } catch {
    erro.value = true
  } finally {
    carregando.value = false
  }
}
onMounted(carregar)
</script>

<template>
  <h1 class="h2 mb-4">Dashboard</h1>
  <p v-if="carregando" role="status">Carregando estatísticas…</p>
  <div v-else-if="erro" class="alert alert-danger" role="alert">
    Não foi possível carregar as estatísticas.
    <button type="button" class="btn btn-link" @click="carregar">Tentar novamente</button>
  </div>
  <p v-else-if="!dados.total_geral" class="alert alert-info" role="status">Nenhum TCC cadastrado.</p>
  <div v-else class="row g-3">
    <div class="col-12 col-xl-5">
      <section class="card card-body shadow-sm h-100 p-4" aria-labelledby="status">
        <h2 id="status" class="h5 mb-4">TCCs por status</h2>
        <div class="d-flex flex-wrap align-items-center justify-content-evenly gap-4 my-auto">
          <div class="rosca" :style="{ background: fundoPizza }" @click="abrirFatia">
            <div class="centro" @click.stop><strong class="fs-2">{{ dados.total_geral }}</strong>Total de TCCs</div>
          </div>
          <ul class="list-unstyled mb-0">
            <li v-for="(f, indice) in fatias" :key="f.nome" class="mb-2">
              <button type="button" class="legenda btn btn-light btn-sm text-start"
                :popovertarget="'detalhe-status-' + indice" @click.prevent="abrirDetalheDoBotao">
                <span class="ponto" :style="{ backgroundColor: f.cor }"></span>{{ f.nome }}
                <strong>{{ f.total }}</strong> ({{ percentual.format(f.fracao) }})
              </button>
              <div :id="'detalhe-status-' + indice" popover="auto" role="dialog"
                :aria-label="'Detalhes do status ' + f.nome" class="detalhe shadow">
                <div class="d-flex justify-content-between align-items-center gap-4 mb-2">
                  <strong><span class="ponto" :style="{ backgroundColor: f.cor }"></span>{{ f.nome }}</strong>
                  <button type="button" class="btn-close" aria-label="Fechar"
                    :popovertarget="'detalhe-status-' + indice" popovertargetaction="hide"></button>
                </div>
                <p class="mb-0">{{ f.total }} {{ f.total === 1 ? 'TCC' : 'TCCs' }} · {{ percentual.format(f.fracao) }} do total</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
    <div class="col-12 col-xl-7">
      <section class="card card-body shadow-sm h-100 p-4" aria-labelledby="defesas">
        <h2 id="defesas" class="h5 mb-3">TCCs por semestre de defesa e status</h2>
        <p v-if="carregandoSemestres" role="status">Carregando semestres…</p>
        <div v-else-if="erroSemestres" role="alert">Não foi possível carregar os semestres.
          <button type="button" class="btn btn-link" @click="carregarSemestres">Tentar novamente</button>
        </div>
        <template v-else-if="semestres.length">
          <div class="d-flex gap-3 mb-3">
            <label class="small">De
              <select aria-label="Semestre inicial" v-model="inicio" class="form-select form-select-sm">
                <option value="">Primeiro semestre</option>
                <option v-for="[s] in semestres" :key="s" :disabled="!!fim && s > fim">{{ s }}</option>
              </select>
            </label>
            <label class="small">Até
              <select aria-label="Semestre final" v-model="fim" class="form-select form-select-sm">
                <option value="">Último semestre</option>
                <option v-for="[s] in semestres" :key="s" :disabled="!!inicio && s < inicio">{{ s }}</option>
              </select>
            </label>
          </div>
          <ul class="colunas list-unstyled mb-0">
            <li v-for="[s, total] in periodo" :key="s">
              <strong>{{ total }}</strong>
              <button type="button" class="coluna" :style="{ height: (total / picoSemestre * 7) + 'rem' }"
                :aria-label="'Ver detalhes de ' + s" :popovertarget="'detalhe-semestre-' + s"
                @click.prevent="abrirDetalheDoBotao">
                <span v-for="[nome, cor] in legendaSemestres" :key="nome"
                  :style="{ background: cor, height: ((contagens.get(s).get(nome) ?? 0) / total * 100) + '%' }"></span>
              </button>
              <span>{{ s }}</span>
              <div :id="'detalhe-semestre-' + s" popover="auto" role="dialog"
                :aria-label="'Semestre ' + s" class="detalhe shadow">
                <div class="d-flex justify-content-between align-items-center gap-4 mb-2">
                  <strong>Semestre {{ s }}</strong>
                  <button type="button" class="btn-close" aria-label="Fechar"
                    :popovertarget="'detalhe-semestre-' + s" popovertargetaction="hide"></button>
                </div>
                <p class="mb-0">{{ total }} {{ total === 1 ? 'TCC' : 'TCCs' }}</p>
                <ul class="list-unstyled mt-2 mb-0">
                  <li v-for="[nome, quantidade] in contagens.get(s)" :key="nome">{{ nome }} · {{ quantidade }}</li>
                </ul>
              </div>
            </li>
          </ul>
          <ul class="list-unstyled d-flex flex-wrap gap-3 mt-2 mb-0 small">
            <li v-for="[nome, cor] in legendaSemestres" :key="nome"><span class="ponto" :style="{ background: cor }"></span>{{ nome }}</li>
          </ul>
        </template>
        <p v-else class="text-muted">Nenhum semestre de defesa informado.</p>
      </section>
    </div>
    <div class="col-12">
      <section class="card card-body shadow-sm p-4" aria-labelledby="coorientacao">
        <h2 id="coorientacao" class="h5 mb-3">TCCs com e sem coorientador</h2>
        <template v-if="dados.por_coorientador">
          <div class="d-flex rounded overflow-hidden mb-2">
            <button v-for="parte in coorientacao.filter(p => p.total > 0)" :key="parte.nome"
              type="button" class="segmento" :aria-label="parte.nome"
              :popovertarget="'coorientacao-' + parte.id"
              :style="{ width: (parte.total / dados.total_geral * 100) + '%', background: parte.cor }"
              @click.prevent="abrirDetalheDoBotao"></button>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <div v-for="parte in coorientacao" :key="parte.nome">
              <button type="button" class="btn btn-light btn-sm" :popovertarget="'coorientacao-' + parte.id"
                @click.prevent="abrirDetalheDoBotao">
                <span class="ponto" :style="{ background: parte.cor }"></span>{{ parte.nome }} · {{ percentual.format(parte.total / dados.total_geral) }}
              </button>
              <div :id="'coorientacao-' + parte.id" popover="auto" role="dialog" :aria-label="parte.nome" class="detalhe shadow">
                <strong>{{ parte.nome }}</strong>
                <button type="button" class="btn-close ms-3" aria-label="Fechar" :popovertarget="'coorientacao-' + parte.id" popovertargetaction="hide"></button>
                <p class="mb-0">{{ parte.total }} {{ parte.total === 1 ? 'TCC' : 'TCCs' }} · {{ percentual.format(parte.total / dados.total_geral) }} do total</p>
              </div>
            </div>
          </div>
        </template>
        <p v-else class="text-muted mb-0">Dados de coorientação indisponíveis.</p>
      </section>
    </div>
    <div class="col-12">
      <section class="card card-body shadow-sm p-4" aria-labelledby="distribuicao">
        <h2 id="distribuicao" class="h5 mb-3">Distribuição de TCCs</h2>
        <div class="row g-2 mb-3">
          <label class="col-sm-4">Agrupar por
            <select v-model="grupo" class="form-select">
              <option v-for="(titulo, chave) in grupos" :key="chave" :value="chave">{{ titulo }}</option>
            </select>
          </label>
          <label class="col-sm-8">Buscar neste gráfico
            <input v-model="busca" class="form-control" type="search" :placeholder="'Buscar por ' + grupos[grupo].toLowerCase()">
          </label>
        </div>
        <ul v-if="linhas.length" class="list-unstyled mb-0">
          <li v-for="[nome, total] in linhas" :key="nome" class="mb-3">
            <div class="d-flex justify-content-between gap-3"><span>{{ nome }}</span><strong>{{ total }}</strong></div>
            <div class="trilho"><div :style="{ width: (total / ranking[0][1] * 100) + '%' }"></div></div>
          </li>
        </ul>
        <p v-else role="status" class="text-muted">{{ busca ? 'Nenhum resultado para essa busca.' : 'Sem dados para este agrupamento.' }}</p>
        <nav v-if="paginas > 1" aria-label="Paginação do gráfico" class="d-flex justify-content-center align-items-center gap-3">
          <button class="btn btn-outline-primary btn-sm" :disabled="pagina === 1" @click="pagina--">Anterior</button>
          <span role="status">Página {{ pagina }} de {{ paginas }}</span>
          <button class="btn btn-outline-primary btn-sm" :disabled="pagina === paginas" @click="pagina++">Próxima</button>
        </nav>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rosca { width: 10rem; height: 10rem; border-radius: 50%; display: grid; place-items: center; }
.centro { background: white; width: 72%; height: 72%; border-radius: 50%; display: grid; align-content: center; text-align: center; font-size: .85rem; }
.ponto { display: inline-block; width: .75rem; height: .75rem; border-radius: 50%; margin-right: .45rem; }
.rosca, .legenda { cursor: pointer; }
.centro { cursor: default; }
.detalhe { position: fixed; inset: auto; margin: 0; width: max-content; max-width: calc(100% - 1rem); padding: 1rem; border: 1px solid #ced4da; border-radius: .75rem; }
.colunas { display: flex; align-items: end; overflow-x: auto; gap: .5rem; padding-bottom: .5rem; }
.colunas > li { flex: 1 0 3.7rem; display: grid; justify-items: center; gap: .3rem; font-size: .85rem; }
.coluna { display: flex; flex-direction: column-reverse; overflow: hidden; width: 65%; max-width: 3rem; min-height: 2px; padding: 0; border: 0; border-radius: .25rem .25rem 0 0; }
.segmento { height: 2rem; border: 0; padding: 0; }
.segmento:hover, .coluna:hover { filter: brightness(.9); }
.trilho { height: .5rem; background: #edf2f5; border-radius: 1rem; overflow: hidden; }
.trilho > div { height: 100%; background: #087e70; }
</style>
