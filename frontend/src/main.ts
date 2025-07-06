import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import qs from 'qs';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


axios.defaults.baseURL = "http://localhost:5192/api/v1"
axios.defaults.paramsSerializer = (params) => {
    return qs.stringify(params)
}

createApp(App)
    .use(store)
    .use(router)
    .use(ElementPlus)
    .mount('#app')
