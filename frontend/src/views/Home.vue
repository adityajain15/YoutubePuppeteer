<template>
  <div class="home">
    <div class="center w-25">
      <template v-for="(video, index) in videos">
        <div :key="`video-${index}`" class="w-100 blip" :number="video" :style="`background: ${color[index]}`"></div>
      </template>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import { scaleLog } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
import { extent } from 'd3-array'
export default {
  name: 'Home',
  components: {
  },
  computed: {
    videos () {
      return this.$store.state.videos.map(d => parseInt(d.views.split(' ')[0].replace(/,/gi, '')))
    },
    domain () {
      return extent(this.videos)
    },
    color () {
      const scale = scaleLog().domain(this.domain)
      return this.videos.map(d => interpolateBlues(scale(d)))
    }
  }
}
</script>
<style>
.blip {
  height: 2px;
}
</style>
