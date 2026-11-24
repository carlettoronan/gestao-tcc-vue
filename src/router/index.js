import { createRouter, createWebHistory } from 'vue-router'
import TccListView from '../views/TccListView.vue'

const routes = [
    { path: '/', name: 'tccs', component: TccListView },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})