// Import necessary libraries
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Import the Vuetify plugin you already defined
import { registerPlugins } from '@/plugins';
import VueKonva from 'vue-konva';
import router from './router';
import vue3GoogleLogin from 'vue3-google-login'
import "./style.css"


// Create Vue app
const app = createApp(App);
const pinia = createPinia()

// Register plugins
registerPlugins(app);

// Use plugins
app.use(vuetify); // Use the imported Vuetify plugin
app.use(VueKonva);
app.use(router);
app.use(pinia)

app.use(vue3GoogleLogin, {clientId: '509878879845-pck882gn0mhtga5daip5amvb4jgaq9mt.apps.googleusercontent.com'})

// Mount the app
app.mount('#app');