import { createSSRApp } from 'vue';
// import { createHead } from '@vueuse/head';
import App from './App.vue';
import { ServerContext, VueContext } from './interfaces/types';
import createRouter /*, { addOnRouter } */ from './router/index';
// import createStore, { key } from './store';

// plugins
// import createAppHead from '@/plugins/fb-app-head';

export default async function(serverContext?: ServerContext) {
  const app = createSSRApp(App);
  // const appHead = createAppHead();
  // const store = createStore();
  const router = createRouter();
  const vueContext: VueContext = { router };
  // const head = createHead();

  // addOnRouter(vueContext, serverContext);
  
  // app.use(head);
  app.use(router);
  
  // app.directive('focus', focus);

  return {
    app,
    // head,
    router,
  };
}
