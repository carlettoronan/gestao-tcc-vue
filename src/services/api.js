import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
})

export default {
    // TCCs
    getTccs(search = '') {
        const params = search ? { search } : {}
        return api.get('tccs/', { params })
    },
    getTcc(id) {
        return api.get(`tccs/${id}/`)
    },
    createTcc(formData) {
        return api.post('tccs/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    updateTcc(id, data) {
        return api.patch(`tccs/${id}/`, data)
    },
    deleteTcc(id) {
        return api.delete(`tccs/${id}/`)
    },
    getEstatisticas() {
        return api.get('tccs/estatisticas/')
    },

    // Entidades auxiliares
    getAlunos(search = '') {
        return api.get('alunos/', { params: search ? { search } : {} })
    },
    getProfessores(search = '') {
        return api.get('professores/', { params: search ? { search } : {} })
    },
    getCursos() {
        return api.get('cursos/')
    },
    getDepartamentos() {
        return api.get('departamentos/')
    },
    getUnidadesAcademicas() {
        return api.get('unidades-academicas/')
    },
}