import { createRouter, createWebHashHistory } from 'vue-router'
import HomeMap from '@/pages/HomeMap.vue'
import DiaryList from '@/pages/DiaryList.vue'
import Album from '@/pages/Album.vue'
import Profile from '@/pages/Profile.vue'
import TripEdit from '@/pages/TripEdit.vue'
import TripDetail from '@/pages/TripDetail.vue'

const router = createRouter({
  // 用 hash 模式：GitHub Pages 是静态托管，刷新子路径不会 404
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeMap, meta: { tab: 'home' } },
    { path: '/diary', name: 'diary', component: DiaryList, meta: { tab: 'diary' } },
    { path: '/album', name: 'album', component: Album, meta: { tab: 'album' } },
    { path: '/mine', name: 'mine', component: Profile, meta: { tab: 'mine' } },
    { path: '/trip/new', name: 'trip-new', component: TripEdit },
    { path: '/trip/:id/edit', name: 'trip-edit', component: TripEdit },
    { path: '/trip/:id', name: 'trip-detail', component: TripDetail },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
