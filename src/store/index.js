import Vue from 'vue'
import Vuex from 'vuex'

import user from './module/user'
import group from './module/group'
import model from './module/model'
import module from './module/module'
import comfunc from './module/comfunc'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //
  },
  mutations: {
    //
  },
  actions: {
    //
  },
  modules: {
    user,
    group,
    model,
    module,
    comfunc
  }
})
