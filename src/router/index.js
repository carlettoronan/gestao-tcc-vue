import { createRouter, createWebHistory } from 'vue-router'
import TccListView from '../views/TccListView.vue'

import AlunoListView from '../views/AlunoListView.vue'
import ProfessorListView from '../views/ProfessorListView.vue'

const routes = [
    { path: '/', name: 'tccs', component: TccListView },
    { path: '/alunos', name: 'alunos', component: AlunoListView },
    { path: '/professores', name: 'professores', component: ProfessorListView },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
