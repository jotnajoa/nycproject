import * as d3 from 'd3'
export default {
    namespaced: true,
    state() {
        return {
            boroSummary: [],
            year: 2021,
            monthlySummary: [],
            yearSummary: [],
            proportionData: []
        }
    },
    mutations: {
        proportionSummary(state, payload) {
            state.proportionData = payload
        },
        yearSummary(state, payload) {
            state.yearSummary = payload;
        },
        createMonthlySummary(state, payload) {
            state.monthlySummary = payload;
        },
        yearChange(state, payload) {
            state.year = payload
        },
        createSummary(state, data) {
            state.boroSummary = [];
            // state.boroSummary.push(payload)
            // 'BK','QN','MN','BX'
            function sum(arr, key) {
                return arr.reduce((a, b) => parseInt(a) + (parseInt(b[key]) || 0), 0)
            }

            const counties = ['BK', 'QN', 'MN', 'BX'];
            const colorArray = ['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'];
            counties.forEach((d, i) => {

                const targetArr = data.filter(t => t.County == d);

                const plateArr = targetArr.map(d => d.Plate);
                const uniquePlate = [...new Set(plateArr)]
                const plateCount = uniquePlate.length;
                const costSum = sum(targetArr, 'Payment Amount');
                const ticketSum = targetArr.length;
                const color = colorArray[i];
                const county = counties[i];
                const year = state.year;
                const obj = { year: year, county: county, count: ticketSum, cost: costSum, color: color, index: i, plateCount: plateCount }
                state.boroSummary.push(obj)
            })
        }
    },
    getters: {
        boroSummary(state) {
            return state.boroSummary
        },
        year(state) {
            return state.year
        },
        monthlySummary(state) {
            return state.monthlySummary
        },
        yearSummary(state) {
            return state.yearSummary
        },
        proportionData(state) {
            return state.proportionData
        }
    },
    actions: {
        async loadData(context, payload) {

            const year = payload;
            context.commit('yearChange', year)
            const data = await d3.json(`${year}data.json`);
            context.commit('createSummary', data);

            const summaryData = await d3.json(`./summaryData/${year}Monthlydata.json`);
            const yearSummary = await d3.json(`./summaryData/${year}Summary.json`);
            const percentData = await d3.json(`./summaryData/percentSummary.json`)

            context.commit('createMonthlySummary', summaryData);
            context.commit('yearSummary', yearSummary);
            context.commit('proportionSummary', percentData)
        }

    }
    // getters: getters
}