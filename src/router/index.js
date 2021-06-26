import { createRouter, createWebHistory } from 'vue-router'

import BoroughSelection from '../views/BoroughSelection.vue'
import BoroughView from '../views/BoroughView.vue'
import YearView from '../views/YearView.vue'
import TicketView from '../views/TicketView.vue'
import Home from '../views/Home.vue'

const routes = [{
        path: '/',
        component: Home
    },
    {
        path: '/boroughselection',
        component: BoroughSelection
    },
    {
        path: '/by_borough',
        redirect: '/by_borough/Brooklyn',
        component: BoroughView
    },
    {
        path: '/by_borough/:county',
        component: BoroughView,
        props: true
    },
    {
        path: '/by_year',
        component: YearView
    },

    {
        path: '/by_ticket',
        component: TicketView
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router