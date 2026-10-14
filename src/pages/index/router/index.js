import Vue from 'vue'
import Router from 'vue-router'
import {route} from './routes'
// go.js
import go from 'gojs'
Vue.prototype.go = go
Vue.use(Router)
const router = new Router({
  mode:'hash',
  routes: route
})
export default router