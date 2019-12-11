import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    buckets: [],
    bucketList: [],
  },
  mutations: {
    SET_BUCKET(state, items) {
      state.buckets = items;
    },
    SET_BUCEKT_LIST(state, items) {
      state.bucketList = items;
    }
  },
  actions: {
  },
  modules: {
  }
})
