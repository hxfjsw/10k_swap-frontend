<template>
  <div>
    <Modal v-model="showModal" title="Your rank is" :top="160">
      <div class="l0k-swap-account-modal-card">
        <div> rank: {{ rank.rank }}</div>
        <div> tvl: {{ rank.info.tvlTotal }}</div>
        <div> score: {{ rank.info.score }}</div>

      </div>
    </Modal>
    <h1>
      LP Contest
    </h1>

    <div class="l0k-swap-analytics">
      <!--        <div>-->
      <!--          <Button>Swap Contest</Button>-->
      <!--        </div>-->
      <div class="l0k-swap-analytics-pairs">

        <div>
          <input type="text" placeholder="0x" class="account_input" v-model="account_address" />
          <Button @click="onClickCheckAccount">Check Account</Button>
        </div>

        <div class="pairs">
          <div class="head">
            <Text class="rank" :size="'small'">Rank</Text>
            <Text class="address" :size="'small'">Address</Text>
            <Text class="tvlTotal" :size="'small'">TVL</Text>
            <Text class="score" :size="'small'">Score</Text>
          </div>
          <div class="contents">
            <div class="content" v-for="(item,i) in pairs?.tvls" :key="item.id" :id="item.account_address">
              <Text class="rank" :size="'small'">{{ i + 1 }}</Text>
              <Text class="address" :size="'small'">{{ item.account_address }}</Text>
              <Text class="tvlTotal" :size="'small'">{{ item.tvlTotal }}</Text>
              <Text class="score" :size="'small'">{{ item.score }}</Text>
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
import { getRankTVLAccounts, getTopTVLAccounts } from "../../server/analytics";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import { computed, onMounted, ref } from "vue";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal.vue";

export default {
  name: "LpRank",
  components: { Button, Text, LoadingIcon, Modal },
  setup() {

    const pairs = ref();

    const {
      state: { chainId }
    } = useStarknet();

    const getLtv = async () => {
      if (chainId.value) {
        pairs.value = await getTopTVLAccounts(chainId.value);

        console.log(pairs.value);
      }
    };

    onMounted(() => getLtv());

    const onClickCheckAccount = async () => {
      let rank_res = await getRankTVLAccounts(chainId.value, account_address.value);
      if(rank_res.rank!=null) {
        rank.value = rank_res.rank;
        showModal.value = true;
      }
    };

    // const showModal = computed({
    //   get: () => store.showAccountModal,
    //   set(newValue) {
    //     store.toggleAccountModal(newValue)
    //   },
    // })

    const showModal = ref(false);
    const account_address = ref("");
    const rank = ref(0);

    return {
      getLtv,
      pairs,
      showModal,
      onClickCheckAccount,
      account_address,
      rank
    };
  }
};
</script>

<style lang="scss">
@import '../../styles/index.scss';

.account_input {
  width: 300px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #E5E5E5;
  padding: 0 20px;
  box-sizing: border-box;
  margin-right: 20px;
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

      .rank {
        width: 50px;
        padding: 0 10px;
      }

      .address {
        width: 500px;
        padding: 0 10px;
      }

      .tvlTotal {
        width: 200px;
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

