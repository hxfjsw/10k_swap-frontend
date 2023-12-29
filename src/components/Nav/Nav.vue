<template>
  <div class="l0k-swap-app-nav-wrap">
    <router-link class="l0k-swap-app-nav" @click="handleChange(nav)"
                 :class="{ 'l0k-swap-app-nav-active': nav.path === route.path }" v-for="nav in navs" :key="nav.path"
                 :to="nav.path"
                 tag="div">
      {{ nav.name }}
    </router-link>

    <a class="l0k-swap-app-nav" href="https://starkid.pro/app" target="_blank">StarkID</a>

    <div class="l0k-swap-app-nav" @mouseenter="onMouseEnter()" ref="myButton">Contest</div>

    <div class="down" v-if="showDropdown" @mouseleave="onMouseLeave()" ref="down"
         :style="{top: top + 'px', left: left + 'px'}">
      <ul class="down_ul">
        <li style="color:orangered">
          <router-link to="/lp_contest">LP Contest</router-link>
        </li>
        <router-link to="/swap_contest">Swap Contest</router-link>
      </ul>
    </div>
  </div>


</template>

<script lang="ts">

import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { SupporteChainId } from "../../constants";
import navs from "./navs";

export default defineComponent({
  props: {},
  components: {
  },
  data: () => {
    return {
      showDropdown: false,
      top: 0,
      left: 0
    };
  },
  computed: {
    navs() {
      return navs[SupporteChainId];
    },
    route() {
      return useRoute();
    },

  },
  methods: {
    onMouseEnter() {
      const button = this.$refs.myButton as any;
      console.log("onMouseOver");
      this.showDropdown = true;
      // console.log(button)
      const rect = button.getBoundingClientRect();
      console.log(rect.left, rect.top); //

      this.top = rect.top + 35;
      this.left = rect.left - 10;
    },
    onMouseLeave() {
      console.log("onMouseLeave");
      this.showDropdown = false;
    },
    handleChange() {

    }
  },

  mounted() {
    console.log(navs);
    console.log(Object.values(navs)[0]);
    Object.values(navs)[1].map((item: any) => {
      console.log(item.name);
      if (item.name === "Analytics") {
        item.name = "Dashboard";
      }
    });
  }
});
//     onMounted(() => {
//       // console.log(navs);
//       // console.log(Object.values(navs)[0]);
//       // Object.values(navs)[1].splice(2, 1)
//       Object.values(navs)[1].map((item: any) => {
//         console.log(item.name);
//         if (item.name === "Analytics") {
//           item.name = "Dashboard";
//         }
//
//       });
//       // Object.values(navs)[1].push({
//       //   path: 'https://starkgate.starknet.io/', name: 'Bridge'
//       // })
//
//     });
//     const handleChange = (nav: any) => {
//       // console.log(nav) // 此处 TS 将抛出异常
//       // if (nav.path.indexOf("https") !== -1) {
//       // window.open(nav.path, "_blank");
//       // }
//     };
//     const showDropdown = ref(false);
//
//
//     const top=ref(0);
//     const left=ref(0);
//
//     const button = this.$refs.myButton;
//
//     const onMouseEnter = () => {
//       console.log("onMouseOver");
//       showDropdown.value = true;
//
//       // console.log(button)
//       // const rect = button.getBoundingClientRect();
//       // console.log(rect.left, rect.top); //
//       //
//       // top.value = rect.top + 35;
//       // left.value = rect.left-10;
//
//     };
//
//     const onMouseLeave = () => {
//       console.log("onMouseLeave");
//       showDropdown.value = false;
//     };
//
//     const route = useRoute();
//     const currentNavs = computed(() => navs[SupporteChainId]);
//
//     return {
//       navs: currentNavs,
//       route,
//       handleChange,
//       onMouseEnter,
//       onMouseLeave,
//       showDropdown,
//       top,
//       left
//     };
//   }
// });
</script>

<style lang="scss" scoped>
@import '../../styles/index.scss';

.down_ul {
  color: white;
  margin: 5px;
  font-size: 14px;
  line-height: 200%
}

.down_ul a {
  color: white;
  margin: 5px;
  font-size: 14px;
  line-height: 200%;
  text-decoration: none; /* 去掉下划线 */
}

.down_ul a:hover {
  color: orangered;
}

.down {
  position: absolute;
  width: 120px;
  //border: 1px solid #fff;
  background: #000;
  border-radius: 10px;
  padding: 5px;
}

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
