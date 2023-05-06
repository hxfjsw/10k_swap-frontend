<template>
  <div class="l0k-swap-app-nav-wrap">
    <router-link class="l0k-swap-app-nav" @click="handleChange(nav)"
      :class="{ 'l0k-swap-app-nav-active': nav.path === route.path }" v-for="nav in navs" :key="nav.path" :to="nav.path"
      tag="div">
      {{ nav.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SupporteChainId } from '../../constants'
import navs from './navs'
export default defineComponent({
  setup() {
    onMounted(() => {
      console.log(navs);
      console.log(Object.values(navs)[0]);
      // Object.values(navs)[1].splice(2, 1)
      Object.values(navs)[1].map((item: any) => {
        console.log(item.name);
        if (item.name === 'Analytics') {
          item.name = "DashBoard"
        }

      })
      Object.values(navs)[1].push({
        path: 'https://starkgate.starknet.io/', name: 'Bridge'
      })
    })
    const handleChange = (nav: any) => {
      console.log(nav) // 此处 TS 将抛出异常
      if (nav.path.indexOf("https") !== -1) {
        window.open(nav.path, "_blank");
      }
    }
    const route = useRoute()
    const currentNavs = computed(() => navs[SupporteChainId])
    return {
      navs: currentNavs,
      route,
      handleChange
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../styles/index.scss';

.l0k-swap-app-nav-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: $font-size-md;

  .l0k-swap-app-nav {
    display: flex;
    align-items: center;
    height: 40px;
    color: $color-white;
    margin-right: 20px;
    text-decoration: none;

    &:last-child {
      margin-right: 0;
    }

    &-active {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: $color-primary;
        border-radius: 4px;
      }
    }
  }
}
</style>
