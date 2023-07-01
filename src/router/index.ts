import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const Swap = () => import('../pages/Swap/index.vue')
const Pool = () => import('../pages/Pool/index.vue')
const Faucet = () => import('../pages/Faucet/index.vue')
const Analytics = () => import('../pages/Analytics/index.vue')
const LpRank = () => import('../pages/Rank/LpRank.vue')
const SwapRank = () => import('../pages/Rank/SwapRank.vue')

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Swap', component: Swap },
  { path: '/pool', name: 'Pool', component: Pool },
  { path: '/faucet', name: 'Faucet', component: Faucet },
  { path: '/analytics', name: 'Analytics', component: Analytics },
  { path: '/lp_contest', name: 'LpRank', component: LpRank },
  { path: '/swap_contest', name: 'SwapRank', component: SwapRank },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
