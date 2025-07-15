import { createApp } from 'vue'
import './style.css'
import axios from 'axios'
import qs from 'qs';
import router from './router'
import './monaco-worker';
import AppView from "./AppView.vue";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.paramsSerializer = (params) => {
    return qs.stringify(params)
}

createApp(AppView)
    .use(router)
    .mount('#app')
