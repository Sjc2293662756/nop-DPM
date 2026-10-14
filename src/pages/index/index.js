// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './index.vue'
import router from './router'
import store from '@/store'
import config from '@/config'
import vcolorpicker from 'vcolorpicker'
import 'babel-polyfill'
import portInfo from '@/lib/portInfo.js'
Vue.prototype.$portInfo = portInfo

import { Table,Slider,RadioGroup ,Radio} from 'view-design';
import 'view-design/dist/styles/iview.css';
import {Page,Message,Spin,DatePicker,Option,Select} from 'iview';

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

import AFTableColumn from 'af-table-column'
Vue.use(AFTableColumn)

import VueAnimateNumber from 'vue-animate-number'
Vue.use(VueAnimateNumber)

import gojs from 'gojs'
Vue.prototype.go = gojs

import moment from 'moment'
Vue.prototype.$moment = moment

Vue.config.productionTip = false
Vue.prototype.$config = config
Vue.component('RadioGroup', RadioGroup);
Vue.component('Radio', Radio);
Vue.component('Slider', Slider);
Vue.component('Table', Table);
Vue.component('DatePicker', DatePicker);
Vue.component('Page', Page);
// Vue.component('Option', Option);
Vue.use(vcolorpicker)

Vue.prototype.$Message = Message;
Vue.prototype.$Spin = Spin;
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
