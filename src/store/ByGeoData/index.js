import * as d3 from 'd3';
export default {
    namespaced: true,
    state() {
        return {
            precinctGeoJson: undefined,
            precinctContourJson: undefined,
        }
    },
    mutations: {
        generateGeoJson(state, payload) {
            state.precinctGeoJson = payload
        },
        generateContourGeoJson(state, payload) {
            state.precinctContourJson = payload
        }
    },
    getters: {
        lengthOfCountour(state) {
            return state.precinctContourGeoJson.features[0].geometry.coordinate.length
        },
        precinctGeoJson(state) {
            return state.precinctGeoJson
        },
        precinctContourJson(state) {
            return state.precinctContourJson
        }
    },
    actions: {
        async generateGeoJson(context) {
            const data = await d3.json(`precinctGeodata.geojson`);
            data.features.forEach((d) => {
                d.clicked = false;
            })
            context.commit('generateGeoJson', data)
        },
        generateContourGeoJson(context) {
            var outlinejson = {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': []
                    }
                }]
            };
            context.generateContourGeoJson(outlinejson)
        }
    }
}