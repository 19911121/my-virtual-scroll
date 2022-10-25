import createApp from './main';

const init = async () => {
  const { app, router } = await createApp();

  router.isReady().then(() => {
    app.mount('#app');
  });
};

init();