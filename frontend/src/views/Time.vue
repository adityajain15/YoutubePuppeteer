<template>
  <div class="home">
    <div class="center w-25">
      <template v-for="(video, index) in videos">
        <div :key="`video-${index}`" class="w-100 blip" :style="`background: ${color[index]}`"></div>
      </template>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import { scaleLog } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
import { max } from 'd3-array'

export default {
  name: 'Time',
  components: {
  },
  computed: {
    videos () {
      return this.$store.state.videos.map(d => this.getTime(d.length))
    },
    domain () {
      return [1, max(this.videos)]
    },
    color () {
      const scale = scaleLog().domain(this.domain)
      return this.videos.map(d => d === 0 ? 'tomato' : interpolateBlues(scale(d)))
    },
    test () {
      const scale = scaleLog().domain(this.domain)
      return this.videos.map(d => scale(d))
    }
  },
  methods: {
    getTime(time) {
      if(!time) { return 0 }
      let waitTimeString = time.split(':').reverse()
      let waitTime = 0
      for (var i = 0; i < waitTimeString.length; i++) {
        waitTime += parseInt(waitTimeString[i]) * Math.pow(60, i)
      }
      return waitTime
    }
  }
}
</script>
<style>
.blip {
  height: 2px;
}
</style>
