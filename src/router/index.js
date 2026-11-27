import { createRouter, createWebHistory } from 'vue-router'
import TccListView from '../views/TccListView.vue'
import TccFormView from '../views/TccFormView.vue'
import DashboardView from '../views/DashboardView.vue'

import AlunoListView from '../views/AlunoListView.vue'
import ProfessorListView from '../views/ProfessorListView.vue'
import CursoListView from '../views/CursoListView.vue'
import DepartamentoListView from '../views/DepartamentoListView.vue'
import UnidadeAcademicaListView from '../views/UnidadeAcademicaListView.vue'

const routes = [
    { path: '/', name: 'tccs', component: TccListView },
    { path: '/tccs/novo', name: 'tccs-novo', component: TccFormView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/alunos', name: 'alunos', component: AlunoListView },
    { path: '/professores', name: 'professores', component: ProfessorListView },
    { path: '/cursos', name: 'cursos', component: CursoListView },
    { path: '/departamentos', name: 'departamentos', component: DepartamentoListView },
    { path: '/unidades-academicas', name: 'unidades-academicas', component: UnidadeAcademicaListView },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
