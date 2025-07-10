import { createApp } from 'vue'
import './style.css'
import PdfqlView from './PdfqlView.vue'
import axios from 'axios'
import qs from 'qs';
import router from './router'
import './monaco-worker';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.paramsSerializer = (params) => {
    return qs.stringify(params)
}

createApp(PdfqlView)
    .use(router)
    .mount('#app')
