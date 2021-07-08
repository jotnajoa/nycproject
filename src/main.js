import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Header from './components/UI/Header.vue'
import YearSelect from './components/UI/YearSelect.vue'

import SwitchForm from './components/UI/SwitchForm.vue'
import LoadingSpinner from './components/UI/LoadingSpinner.vue'
import BoroughAnalysis from './components/BoroughAnalysis.vue'
import LineGraph from './components/UI/LineGraph.vue';

const app = createApp(App);
app.use(router)

app.use(store)
app.component('Header', Header)

app.component('YearSelect', YearSelect)
app.component('SwitchForm', SwitchForm)
app.component('LoadingSpinner', LoadingSpinner)
app.component('BoroughAnalysis', BoroughAnalysis)
app.component('LineGraph', LineGraph)
app.mount('#app')