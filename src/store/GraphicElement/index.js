export default {
    namespaced: true,
    state() {
        return {
            cameraZ: 5,
            maxRadius: 2,
            spacing: 2
        }
    },
    mutations: {
        cameraChange(state, payload) {
            state.cameraZ = payload
        },
        radiusChange(state, payload) {
            state.maxRadius = payload
        },
        spacingChange(state, payload) {
            state.spacing = payload
        }
    },
    getters: {
        cameraZ(state) { return state.cameraZ },
        maxRadius(state) { return state.maxRadius },
        spacing(state) { return state.spacing }
    },
    actions: {
        cameraChange(context, payload) {
            context.commit('cameraChange', payload)
        },
        radiusChange(context, payload) {
            context.commit('radiusChange', payload)
        },
        spacingChange(context, payload) {
            context.commit('spacingChange', payload)
        }
    }
    // getters: getters
}