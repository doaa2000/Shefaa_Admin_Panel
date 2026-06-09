import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from '@/router';
import { registerServices } from '@/providers/registerServices';

// Styles: Tailwind utilities first, then the design-system tokens/classes which
// are the visual source of truth and must win over utilities.
import '@/shared/styles/tailwind.css';
import '@/shared/styles/design-system.css';

// Composition root: bind repositories + services into the DI container.
registerServices();

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
