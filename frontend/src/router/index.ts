import {createRouter, createWebHistory} from 'vue-router'
import {type RouteRecordRaw} from 'vue-router'
import PdfqlView from "../PdfqlView.vue";
import NotFoundView from "../NotFoundView.vue";

const getPath = (url: string) => {
  const baseUrl = import.meta.env.BASE_URL
  return baseUrl + url
}

const routes: Array<RouteRecordRaw> = [
  {
    path: getPath(':pathMatch(.*)*'),
    redirect: _ => {
      return { path: getPath('error/404') }
    },
  },
  {
    path: getPath('error/404'),
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Page is not found'
    }
  },
  {
    path: getPath(""),
    name: 'Pdfql',
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
