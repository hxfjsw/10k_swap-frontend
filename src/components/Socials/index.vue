<template>
  <div class="l0k-swap-socials">
    <a class="l0k-swap-social" v-for="(item, i) in socials" :key="i" :href="item.link" target="_blank">
      <img :src="item.icon" style="width: 80%;height: 80%" />
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DiscordIcon from './discord.png'
import GithubIcon from './github.png'
import DocIcon from './doc.png'
// import MediumIcon from './medium.png'
import MirrorIcon from './mirror.png'
import TwitterIcon from './twitter.png'

const socials = [
  { link: 'https://x.com/astroswapreal', icon: TwitterIcon },
  { link: 'https://github.com/Astro-swap/Contracts', icon: GithubIcon },
  { link: 'https://docs.starkex.org/', icon: DocIcon },
  { link: 'https://discord.gg/b3XwHcC5Qy', icon: DiscordIcon },
  // { link: '#', icon: DocIcon },
]

export default defineComponent({
  setup() {
    return {
      socials,
    }
  },
})
</script>

<style lang="scss">
.l0k-swap-socials {
  display: flex;
  align-items: center;
  .l0k-swap-social {
    margin-right: 12px;
    &:last-child {
      margin-right: 0;
    }
    img {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
