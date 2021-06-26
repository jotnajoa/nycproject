import * as d3 from 'd3';
export default {
    namespaced: true,
    state() {
        return {
            targetYearData: undefined,
            targetYear: 2021,
            targetPrecinct: undefined,
            // frequencyPerplate: undefined,
            byMonthData: undefined,
            byCostData: undefined,
            precinctCost: undefined,
            boroughAvgCost: undefined,
            precinctFreq: undefined,
            boroughAvgFreq: undefined,
            boroughNumberofPlate: undefined
        }
    },
    mutations: {
        createYearData(state, payload) {
            state.targetYearData = payload
        },
        changeTargetYear(state, payload) {
            state.targetYear = payload
        },
        setTargetPrecinct(state, payload) {
            // since parent store doesn't store precinct level selection
            state.targetPrecinct = payload
        }
    },
    actions: {

        changeTargetYear(context) {
            const selectedYear = context.rootGetters.yearSelected;
            context.commit('changeTargetYear', selectedYear)
        },

        async loadYearData(context) {
            const year = context.state.targetYear;
            const data = await d3.json(`${year}data.json`);
            console.log(data)
            context.commit('createYearData', data);
        },

        setTargetPrecinct(context, payload) {
            context.commit('setTargetPrecinct', payload)
        }
    },
    getters: {
        targetPrecinct(state) {
            return state.targetPrecinct;
        },
        targetYearData(state) {
            return state.targetYearData;
        },
        precinctCost(state) {
            if (state.targetYearData) {
                const targetPrecinct = state.targetPrecinct;
                const precinctArr = state.targetYearData.filter((d) => {
                    return d['Precinct'] == targetPrecinct
                });
                const costArr = precinctArr.map(d => d['Payment Amount']);
                const costSum = costArr.reduce((a, b) => { return a + b }, 0);

                return costSum
            } else {
                return 0;
            }
        },
        boroughAvgCost(state, getters, _, rootGetters) {

            var targetBorough = rootGetters.boroughSelected;
            var boroughInitial = targetBorough == 'Manhattan' ? 'MN' :
                targetBorough == 'Brooklyn' ? 'BK' :
                targetBorough == 'Queens' ? 'QN' :
                targetBorough == 'Bronx' ? 'BX' : 'unknown';

            const boroughArr = Array.from(state.targetYearData.filter(d => d['County'] == boroughInitial));
            const costArr = boroughArr.map(d => d['Payment Amount']);
            const costSum = costArr.reduce((a, b) => { return a + b }, 0);


            var boroughPrecinctUniqueArr = []
            boroughArr.forEach((d) => {
                boroughPrecinctUniqueArr.push(d['Precinct'])
            })
            console.log(boroughPrecinctUniqueArr)
            var uniqPrecinct = [...new Set(boroughPrecinctUniqueArr)]
            const boroughLength = uniqPrecinct.length;
            const avgCost = Math.round(costSum * 10 / boroughLength) / 10;
            return avgCost
        },
        selectedBoroughData(state, getters, _, rootGetters) {
            // 선택된 borough
            var targetBorough = rootGetters.boroughSelected;
            var boroughInitial = targetBorough == 'Manhattan' ? 'MN' :
                targetBorough == 'Brooklyn' ? 'BK' :
                targetBorough == 'Queens' ? 'QN' :
                targetBorough == 'Bronx' ? 'BX' : 'unknown';

            const boroughArr = Array.from(state.targetYearData.filter(d => d['County'] == boroughInitial));
            console.log(boroughArr)
            return boroughArr
        }
    }
}