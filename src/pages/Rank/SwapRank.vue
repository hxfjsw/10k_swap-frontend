<template>
  <div>
    <h1>
      Swap Contest
    </h1>

    <div style="width: 1075px;margin: 0 auto;padding: 0">
      <div class=""
           style="margin: 0;background-color: #111524;height: 200px;width: 500px;border-radius:20px;padding:16px;float: left">
        <div>
          <p style="font-size: 48px;color: #d5532a">Swap Contest</p>
          <p style="margin-top: 20px;font-size: 20px;color: gray">
            By participating in the Swap Contest you can gain your score which will be a reference for retroactive
            rewards.
          </p>
          <br /><br />
          <router-link to="/" class="l0k-swap-button trade_now">Trade Now</router-link>
        </div>
      </div>
      <div class=""
           style="background-color: #111524;height: 200px;width: 500px;border-radius:20px;padding:16px;float: right">

        <div style="font-size: 48px;color: #d5532a">StarkEx
          <div v-if="rank!=null" style="font-size: 24px; position: relative;float: right">Rank {{ rank.rank }}</div>
          <div v-else-if="account" style="font-size: 24px; position: relative;float: right">Rank 0</div>
        </div>


        <div style="margin-top: 20px;color: gray;font-size: 20px; ">


          <div style="font-size: 38px;margin: auto 0;width: 100%;text-align: center" v-if="account">
            {{ fix(account).substr(0, 12) + "..." + account.substr(account.length - 10, 10) }}
          </div>
          <br/>
          <div style="color: gray;font-size: 18px" v-if="rank">Score:  {{ (Number)(rank.info.volumeTotal).toFixed(2) }}
<!--          Volume Total: {{ (Number)(rank.info.volumeTotal).toFixed(4) }} USD -->
          </div>
          <div style="color: gray;font-size: 18px" v-else-if="account">
            Score: 0
            </div>
        </div>
      </div>
      <div style="clear: both"></div>
    </div>

    <div class="l0k-swap-analytics" style="margin-top: 10px !important;">
      <div class="l0k-swap-analytics-pairs">

        <div class="pairs">
          <div class="head">
            <Text class="rank" :size="'small'">Rank</Text>
            <Text class="address" :size="'small'">Address</Text>
            <Text class="volumeTotal" :size="'small'">Volume Total</Text>
          </div>
          <div class="contents">
            <div class="content" v-for="(item,i) in pairs?.volumes" :key="item.id">
              <Text class="rank" :size="'small'">{{ ((currentPage - 1) * 25) + i + 1 }}</Text>
              <Text class="address" :size="'small'">{{ item.account_address }}</Text>
              <Text class="volumeTotal" :size="'small'">{{ item.volumeTotal }}</Text>
            </div>
          </div>
        </div>

        <ElPagination
          small
          :page-size="25"
          :total="100"
          :current-page="currentPage"
          layout="prev, pager, next"
          @update:current-page="onPageChange"
        />

        <div class="loading" v-if="!pairs">
          <LoadingIcon />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { LoadingIcon } from "../../components/Svg";
import Text from "../../components/Text/Text.vue";
import { getTopVolumeAccounts, getRankVolumeAccounts } from "../../server/analytics";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import { onMounted, ref, watch } from "vue";
import { ElPagination } from "element-plus";

export default {
  name: "SwapRank",
  components: { Text, LoadingIcon, ElPagination },
  setup() {

    const pairs = ref();

    const {
      state: { chainId, account }
    } = useStarknet();

    const getLtv = async () => {
      if (chainId.value) {
        pairs.value = null;
        const res = await getTopVolumeAccounts(chainId.value, currentPage.value);

        pairs.value = res;
        console.log(pairs.value);
      }
    };

    const myRank = async () => {
      if (chainId.value) {
        const rank_res = await getRankVolumeAccounts(chainId.value,
          // "0x0672e901042958066dddef68c4089c620046222ae019e9ea5c3e5fd7d8456b15");
        account.value);
        rank.value = rank_res.rank;
        console.log(rank_res);
      }
    };
    const rank = ref(null);

    onMounted(() => getLtv());
    onMounted(() => myRank());


    watch(account,async ()=>{
     await myRank();
    })


    const currentPage = ref(1);

    const onPageChange = (page) => {
      currentPage.value = page;
      getLtv();
    };

    const fix = (account_address)=>{
      if(account_address.length <66){
        account_address = '0x'+account_address.substring(2).padStart(64,'0');
      }
      return account_address;
    }

    return {
      getLtv,
      myRank,
      pairs,
      account,
      rank,
      currentPage,
      onPageChange,
      fix
    };
  }
};
</script>

<style lang="scss">
@import '../../styles/index.scss';

.trade_now {
  width: 100px;
  text-decoration: none; /* 去掉下划线 */
}

.l0k-swap-analytics {
  width: 1040px;
  border-radius: 20px;
  background: $color-white;
  margin: 28px auto;
  padding: 20px;

  @media screen and (max-width: 1040px) {
    width: calc(100% - 24px);
    margin: 8px 12px;
    padding: 20px 12px;
    box-sizing: border-box;
  }

  .charts {
    display: flex;
    justify-content: space-between;

    .chart-wrapper {
      flex: 1;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;

      &:first-child {
        margin-right: 16px;
      }

      .last {
        display: flex;

        .change {
          margin-top: 14px;
          margin-left: 8px;
        }
      }

      .chart {
        width: 100%;
        height: 196px;
      }
    }

    @include mobile {
      flex-direction: column;
      justify-content: center;

      .chart-wrapper {
        padding: 0;

        &:first-child {
          margin-right: 0;
          margin-bottom: 32px;
        }
      }
    }
  }

  .el-pagination {
    justify-content: flex-end;

    .el-pager li {
      margin-left: 5px;
      background-color: #d5532a;
      color: $color-white;
    }

    .el-pager li.is-active {
      background: $color-nav-blue;
      color: $color-white;
      border-radius: 8px;
    }
  }

  .el-date-editor {
    width: 348px;
    border-radius: 20px;

    @include mobile {
      width: 100%;
      box-sizing: border-box;
    }
  }
}


.l0k-swap-analytics-pairs {
  padding: 16px;
  margin-top: 16px;
  background: $color-white;

  .header {
    display: flex;
    align-items: center;

    .title {
      width: 100px;
    }

    .date-picker {
      width: 368px;
    }
  }

  .pairs {
    margin-top: 12px;
    overflow: auto;
    width: 100%;

    .head,
    .contents {
      display: flex;
      width: 1008px;

      .name {
        width: 170px;
        padding: 0 10px;
      }

      .liquidity,
      .volume_24h,
      .volume_7d,
      .fees_24h,
      .total_fees {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1;
        padding: 0 10px;
      }

      .address {
        width: 700px;
        padding: 0 10px;
      }

      .tvlTotal {
        width: 200px;
        padding: 0 10px;
      }


      .rank {
        width: 50px;
        padding: 0 10px;
      }
    }

    .head {
      height: 32px;
      background: $color-bg-secondary;
      border-radius: 8px 0px 0px 8px;

      .name {
        display: flex;
        align-items: center;
      }

      .name,
      .liquidity,
      .volume_24h,
      .volume_7d,
      .fees_24h,
      .total_fees {
        font-weight: 500;
      }
    }

    .contents {
      flex-direction: column;

      .content {
        display: flex;
        align-items: center;
        height: 40px;

        .name {
          display: flex;
          align-items: center;

          .no {
            margin-right: 5px;
            width: 22px;
          }

          .symbol {
            margin-left: 12px;
          }
        }
      }
    }
  }

  @include mobile {
    padding: 0;
    .header {
      align-items: flex-start;
      flex-direction: column;

      .date-picker {
        width: 100%;
        box-sizing: border-box;
        margin-top: 8px;
      }
    }
  }
}

</style>

