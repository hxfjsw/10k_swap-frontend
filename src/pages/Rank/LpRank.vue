<template>
  <div>
    <!--    <Modal v-model="showModal" title="Your rank is" :top="160">-->
    <!--      <div class="l0k-swap-account-modal-card">-->
    <!--        <div> rank: {{ rank.rank }}</div>-->
    <!--        <div> tvl: {{ rank.info.tvlTotal }}</div>-->
    <!--        <div> score: {{ rank.info.score }}</div>-->

    <!--      </div>-->
    <!--    </Modal>-->
    <!--    <h1>-->
    <!--      LP Contest-->
    <!--    </h1>-->


    <div style="margin-top: 10px"></div>
    <div style="width: 1075px;margin: 0 auto;padding: 0">
      <div class=""
           style="margin: 0px;background-color: #111524;height: 200px;width: 500px;border-radius:20px;padding:16px;float: left">
        <div>
          <p style="font-size: 48px;color: #d5532a">LP Contest</p>
          <p style="margin-top: 20px;font-size: 20px;color: gray">
            By participating in the LP Contest you can win your Scores and NFTs which will be references for retroactive
            rewards.
          </p>
          <br /><br />
          <router-link to="/pool" class="l0k-swap-button trade_now">Add Liquidity</router-link>
        </div>
      </div>
      <div class=""
           style="background-color: #111524;height: 200px;width: 500px;border-radius:20px;padding:16px;float: right">

        <div style="font-size: 48px;color: #d5532a">AstroSwap
          <div style="font-size: 24px; position: relative;float: right" v-if="rank && rank.info">Rank {{ rank.rank }}</div>
          <div style="font-size: 24px; position: relative;float: right" v-else-if="account">Rank 0</div>

        </div>

        <div style="margin-top: 20px;color: gray;font-size: 20px;" >
          <div style="font-size: 38px;margin: auto 0;width: 100%;text-align: center" v-if="account">
            {{ fix(account).substr(0, 12) + "..." + account.substr(account.length - 10, 10) }}
          </div>
          <br />
          <div style="color: gray;font-size: 18px" v-if="rank!=null && rank.info!=null">
            Score:   {{   (Number)(rank.info.score).toFixed(2) }}
          </div>
          <div style="color: gray;font-size: 18px" v-else-if="account">
            Score: 0
          </div>
          <div style="color: gray;font-size: 18px;margin-top: 10px" v-if="rank!=null && rank.info!=null">
            Eligible for NFT: Genesis LP {{ rank.nft }}
          </div>
          <div style="color: gray;font-size: 18px;margin-top: 10px" v-else-if="account">
            Eligible for NFT: Not Eligible
          </div>
        </div>
      </div>
      <div style="clear: both"></div>
    </div>

    <div class="l0k-swap-analytics" style="margin-top: 10px !important;margin-bottom: 0px !important;">
      <div class="l0k-swap-analytics-pairs nft_images">
        <div>
          <img src="./nft2.png" width="200" />
          <img src="./1.png" style="margin-top: 15px">
<!--          <p style="color: white;width: 100%;text-align: center">Genesis LP1 <br /> （Top 5%）</p>-->
        </div>
        <div>
          <img src="./nft3.png" width="200" />
          <img src="./2.png" style="margin-top: 15px">
          <!--          <p style="color: white;width: 100%;text-align: center">Genesis LP2 <br /> （5%-20%）</p>-->
        </div>
        <div>
          <img src="./nft1.png" width="200" />
          <img src="./3.png" style="margin-top: 15px">
          <!--          <p style="color: white;width: 100%;text-align: center">Genesis LP3 <br /> （20%-50%）</p>-->
        </div>
        <div>
          <img src="./nft4.png" width="200" />
          <img src="./4.png" style="margin-top: 15px">
          <!--          <p style="color: white;width: 100%;text-align: center">Genesis LP4 <br /> （50%-100%）</p>-->
        </div>
      </div>
    </div>

    <div class="l0k-swap-analytics" style="margin-top: 10px !important;">
      <!--        <div>-->
      <!--          <Button>Swap Contest</Button>-->
      <!--        </div>-->
      <div class="l0k-swap-analytics-pairs">

        <!--        <div>-->
        <!--          <input type="text" placeholder="0x" class="account_input" v-model="account_address" />-->
        <!--          <Button @click="onClickCheckAccount">Check Account</Button>-->
        <!--        </div>-->

        <div class="pairs">
          <div class="head">
            <Text class="rank" :size="'small'">Rank</Text>
            <Text class="address" :size="'small'">Address</Text>
            <Text class="tvlTotal" :size="'small'">TVL</Text>
            <Text class="score" :size="'small'">Score</Text>
          </div>
          <div class="contents">
            <div class="content" v-for="(item,i) in pairs?.tvls" :key="item.id" :id="item.account_address">
              <Text class="rank" :size="'small'">{{ ((currentPage - 1) * 25) + i + 1 }}</Text>
              <Text class="address" :size="'small'">{{ item.account_address }}</Text>
              <Text class="tvlTotal" :size="'small'">{{ item.tvlTotal }}</Text>
              <Text class="score" :size="'small'">{{ item.score }}</Text>
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

<script  lang="ts">
import { LoadingIcon } from "../../components/Svg";

import Text from "../../components/Text/Text.vue";
import { getRankTVLAccounts, getTopTVLAccounts } from "../../server/analytics";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import { computed, onMounted, Ref, ref, watch } from "vue";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal.vue";
import { ElPagination } from "element-plus";
import { StarknetChainId } from 'l0k_swap-sdk'

export default {
  name: "LpRank",
  components: { Button, Text, LoadingIcon, Modal, ElPagination },
  setup() {

    const pairs = ref();

    const {
      state: { chainId, account }
    } = useStarknet();

    const getLtv = async () => {
      if (chainId.value) {
        pairs.value = null;
        pairs.value = await getTopTVLAccounts(chainId.value, currentPage.value);

        console.log(pairs.value);
      }
    };


    onMounted(() => getLtv());


    const rank:Ref<null|any> = ref(null);

    const onClickCheckAccount = async (account_address:string) => {
      if(chainId.value == undefined){
        console.error("LP Rank chainId.value == undefined")
        return;
      }

      rank.value = null;
      let rank_res = await getRankTVLAccounts(chainId.value,
        // "0x0778a36227a2fd4639dffd18b860fe0253509f6e560e67eab463f5ee28856564");
      account_address);
      rank.value = rank_res.rank;

      if (rank.value != null) {
        if (rank.value.top <= 0.05) {
          rank.value.nft = 1;
        } else if (rank.value.top > 0.05 && rank.value.top <= 0.2) {
          rank.value.nft = 2;
        } else if (rank.value.top > 0.2 && rank.value.top <= 0.5) {
          rank.value.nft = 3;
        } else {
          rank.value.nft = 4;
        }
      }

      // account.value);
      // if (rank_res.rank != null) {
      //   rank.value = rank_res.rank;
      //   showModal.value = true;
      // }
    };

    // const showModal = computed({
    //   get: () => store.showAccountModal,
    //   set(newValue) {
    //     store.toggleAccountModal(newValue)
    //   },
    // })

    const showModal = ref(false);
    const account_address = ref("");

    const currentPage = ref(1);

    const onPageChange = (page:number) => {
      currentPage.value = page;
      getLtv();
    };

    watch(account,async()=> {
      // alert("account change"+account.value)
      if(account.value) {
        await onClickCheckAccount(account.value);
      }
    })

    onMounted(() =>{
      if(account.value) {
        onClickCheckAccount(account.value)
      }
    });

    const fix = (account_address:string)=>{
      if(account_address.length <66){
        account_address = '0x'+account_address.substring(2).padStart(64,'0');
      }
      return account_address;
    }

    return {
      getLtv,
      pairs,
      showModal,
      onClickCheckAccount,
      account_address,
      rank,
      currentPage,
      onPageChange,
      account,
      fix
    };
  }
};
</script>

<style lang="scss">
@import '../../styles/index.scss';


.nft_images {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.nft_images > div > img {
  display: block;
  margin: 0 auto;
  border-radius: 10px;
}

.trade_now {
  width: 150px;
  text-decoration: none; /* 去掉下划线 */
}

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

