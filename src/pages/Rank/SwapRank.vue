<template>
  <div>
    <h1>
      Swap Contest
    </h1>

    <div style="width: 1040px;margin: 0 auto">
      <div class="" style="background-color: #111524;height: 200px;width: 500px;border-radius:20px;padding:16px;float: left">
        <div>
          <p style="font-size: 48px;color: orange">Leaderboard</p>
          <p style="margin-top: 20px;font-size: 20px;color: gray">Exclusive ranking for AVNU traders. Trade, earn points, and
            win unique rewards.
          </p>
          <br/>
          <router-link to="/">Trade Now</router-link>
        </div>
      </div>
      <div class="" style="background-color: #111524;height: 200px;width: 400px;border-radius:20px;padding:16px;float: right">
        <div style="color: gray;font-size: 20px">
          <p style="font-size: 48px;color: orange">StarkEx</p>

          <p>0x138a...917c </p>
        <p>Rank: 1</p>
        <p>Score: 100000</p>
        <p>Volume Total: 100000 USD</p>
        </div>
      </div>
      <div style="clear: both"></div>
    </div>

    <div class="l0k-swap-analytics">
      <div class="l0k-swap-analytics-pairs">

        <div class="pairs">
          <div class="head">
            <Text class="rank" :size="'small'">Rank</Text>
            <Text class="address" :size="'small'">Address</Text>
            <Text class="volumeTotal" :size="'small'">Volume Total</Text>
          </div>
          <div class="contents">
            <div class="content" v-for="(item,i) in pairs?.volumes" :key="item.id">
              <Text class="rank" :size="'small'">{{ i + 1 }}</Text>
              <Text class="address" :size="'small'">{{ item.account_address }}</Text>
              <Text class="volumeTotal" :size="'small'">{{ item.volumeTotal }}</Text>
            </div>
          </div>
        </div>

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
import { getTopVolumeAccounts } from "../../server/analytics";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import { onMounted, ref } from "vue";

export default {
  name: "LpRank",
  components: { Text, LoadingIcon },
  setup() {

    const pairs = ref();

    const {
      state: { chainId }
    } = useStarknet();

    const getLtv = async () => {
      if (chainId.value) {
        pairs.value = await getTopVolumeAccounts(chainId.value);

        console.log(pairs.value);
      }
    };

    onMounted(() => getLtv());


    return {
      getLtv,
      pairs
    };
  }
};
</script>

<style lang="scss">
@import '../../styles/index.scss';

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

