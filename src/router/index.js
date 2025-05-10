import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: () => import('../views/Playlist.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
