import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  RouteRecordRaw,
} from 'vue-router';
import AppConfig from '@/configs/app.config';

const createHistory = import.meta.env.SSR ? createMemoryHistory : createWebHistory;
const isMobile = false;
const routes: Array<RouteRecordRaw> = [{
  path: '/:pathMatch(.*)*',
  name: 'error',
  redirect: '/error/404',
}, {
  path: AppConfig.PagePaths.Root,
  name: 'root',
  component: isMobile
    ? () => import('@/views/main.vue')
    : () => import('@/views/main.vue'),
  meta: {
    title: '',
    scopes: [],
  }
}];

export default function() {
  const router = createRouter({
    history: createHistory(),
    routes: [
      ...routes,
    ],
    
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      }
      else {
        // TODO: check if parent in common that works with alias
        if (to.matched.every((record, i) => from.matched[i] !== record))
          return {
            left: 0,
            top: 0
          };
      }

      // leave scroll as it is by not returning anything
      // https://github.com/Microsoft/TypeScript/issues/18319
      return false;
    }
  });

  return router;
}