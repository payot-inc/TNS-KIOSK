import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Products from '../views/Products.vue';
import Pay from '../views/Pay.vue';
import Result from '../views/Result.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/products',
    name: 'products',
    component: Products,
  },
  {
    path: '/pay',
    name: 'pay',
    component: Pay,
    props: true,
  },
  {
    path: '/result',
    name: 'result',
    component: Result,
    props: true,
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
