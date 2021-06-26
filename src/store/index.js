import { createStore } from 'vuex'
import Landing from './Landing/index.js'
import GuiElement from './GraphicElement/index.js'
import ByGeoData from './ByGeoData/index.js'
import ByTicketData from './ByTicketData/index.js'

export default createStore({
    state() {
        return {
            yearSelected: 2021,
            isLoading: true,
            boroughSelected: 'Brooklyn'
        }
    },
    mutations: {
        selectingYear(state, payload) {
            state.yearSelected = payload
        },
        loadingChange(state, payload) {
            state.isLoading = payload
        },
        boroughChange(state, payload) {
            state.boroughSelected = payload
        }
    },
    actions: {
        selectingYear(context, payload) {
            context.commit('selectingYear', payload)
        },
        loadingChange(context, payload) {
            context.commit('loadingChange', payload)
        },
        boroughChange(context, payload) {
            context.commit('boroughChange', payload)
        }
    },
    modules: {
        Landing: Landing,
        GuiElement: GuiElement,
        ByGeoData: ByGeoData,
        ByTicketData: ByTicketData
    },
    getters: {
        yearSelected(state) { return state.yearSelected },
        isLoading(state) { return state.isLoading },
        boroughSelected(state) { return state.boroughSelected }
    }
})