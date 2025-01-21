import { createWebHistory, createRouter } from "vue-router";
import navItems from './navbarItems';

const routes = navItems;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;