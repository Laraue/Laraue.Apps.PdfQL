import {createRouter, createWebHistory} from 'vue-router'
import {type RouteRecordRaw} from 'vue-router'
import PdfqlView from "../PdfqlView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'pdfql',
    component: PdfqlView,
    meta: {
      title: 'PDF objects extractor'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  document.title = to.meta.title as string;
  next();
});

export default router
