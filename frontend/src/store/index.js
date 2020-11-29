import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    videos: []
  },
  mutations: {
    setVideos (state, videos) {
      state.videos = videos
    }
  },
  actions: {
    async getVideos ({ commit }) {
      const videoResponse = await fetch('http://localhost:8000/videos')
      const videos = await videoResponse.json()
      commit('setVideos', videos)
    }
  },
  modules: {
  }
})
