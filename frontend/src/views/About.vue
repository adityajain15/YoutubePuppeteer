<template>
  <div class="home">
    <div class="center w-25">
      <template v-for="(video, index) in videos">
        <div :key="`video-${index}`" class="w-100 blip" :style="`background: ${colors[video]}`"></div>
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
const randomColor = require('randomcolor')

export default {
  name: 'About',
  components: {
  },
  computed: {
    videos () {
      return this.$store.state.videos.map(d => d.category)
    },
    categories () {
      return new Set(this.videos)
    },
    colors () {
      if(this.categories.size > 6) {throw Error('MORE THAN 6 CATEGORIES UPDATE YOUR OBJECT')}
      return {"News & Politics":"hsla(204, 69.47%, 70.525%, 0.4131898756169088)","Education":"hsla(0, 79.33%, 70.97%, 0.7367468013720055)","Comedy":"hsla(285, 84.98%, 80.02499999999999%, 0.10777928214274879)","Howto & Style":"hsla(132, 82.76%, 76.8%, 0.7775506472999762)","Entertainment":"hsla(248, 68.99%, 64.525%, 0.7545969653755249)","Nonprofits & Activism":"hsla(245, 100%, 79.5%, 0.7101178264922603)"}
      const categories = Array.from(this.categories)
      const colors = randomColor({
        count: categories.length,
        luminosity: 'light',
        format: 'hsla' // e.g. 'hsla(27, 88.99%, 81.83%, 0.6450211517512798)'
      })
      const map = {}
      for(let i = 0; i < categories.length; i++) {
        map[categories[i]] = colors[i]
      }
      return map
    }
  }
}
</script>
<style>
.blip {
  height: 2px;
}
</style>
