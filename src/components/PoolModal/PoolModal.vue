<template>
  <Modal v-model="showModal" :top="currentNav === Actions.BURN ? '80px' : isMobile ? '30%' : '140px'">
    <template v-slot:header>
      <ModalHeader>
        <template v-slot:left>
          <BackIcon class="l0k-swap-pair-modal-icon" @click="showModal = false" />
        </template>
        <Tabs :tabs="tabs" :current="currentNav" @change="onChange" />
        <template v-slot:right>
          <div>
            <a href="javascript:;">
              <img src="./query.png" style="width: 22px;height: 22px;margin-right: 10px" @click="onAddToken" />
            </a>
            <!--            <QueryIcon class="l0k-swap-pair-modal-icon" @click="onAddToken" style="margin-right: 10px" />-->
            <SettingIcon class="l0k-swap-pair-modal-icon" @click="onSetting" />
          </div>
        </template>
      </ModalHeader>
    </template>
    <div class="l0k-swap-pair-modal">
      <div v-if="currentNav === Actions.MINT">
        <AddLiquidity ref="childComponentRef" />
      </div>
      <div v-if="currentNav === Actions.BURN">
        <RemoveLiquidity :pair="removeLiquidityPair ?? undefined" />
      </div>
    </div>
  </Modal>
  <AddTokenModal :show="swapState.showAddTokenModal" @dismiss="swapState.showAddTokenModal=false"
                 @confirm="confirmAddToken"  @select_token="onSelectToken" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive, toRaw, watch,ref } from "vue";
import { useI18n } from "vue-i18n";
import Modal from "../Modal/Modal.vue";
import ModalHeader from "../Modal/ModalHeader.vue";
import Tabs from "./Tabs.vue";
import AddLiquidity from "../AddLiquidity/AddLiquidity.vue";
import RemoveLiquidity from "../RemoveLiquidity/RemoveLiquidity.vue";
import { BackIcon, SettingIcon, AddIcon, QueryIcon } from "../Svg";
import { useModalStore, useSlippageToleranceSettingsStore, usePoolModalStore, useMintStore } from "../../state";
import { Actions } from "../../state/poolModal";
import { Pair, Token } from "l0k_swap-sdk";
import useIsMobile from "../../hooks/useIsMobile";
import AddTokenModal from "../../components/transaction/AddTokenModal.vue";
import { Provider } from "starknet";
import { Contract } from "starknet/dist/contract/default";
import { parseBN2String } from "../../utils";
import { addToken, existToken } from "../../constants/tokens";
import { Field } from "../../state/swap/types";

export default defineComponent({
  components: {
    Modal,
    ModalHeader,
    BackIcon,
    SettingIcon,
    AddIcon,
    QueryIcon,
    Tabs,
    AddLiquidity,
    RemoveLiquidity,
    AddTokenModal
  },
  setup() {

    const childComponentRef = ref(null)

    const { t } = useI18n();
    const modalStore = useModalStore();
    const isMobile = useIsMobile();
    const poolModalStore = usePoolModalStore();
    const mintStore = useMintStore();
    const slippageToleranceSettingsStore = useSlippageToleranceSettingsStore();

    const addLiquidityPair = computed(() => poolModalStore.addLiquidityPair);
    const removeLiquidityPair: ComputedRef<Pair | undefined> = computed(() => poolModalStore.removeLiquidityPair as Pair);

    watch([addLiquidityPair], () => {
      if (addLiquidityPair.value) {
        mintStore.selectToken({
          tokenA: addLiquidityPair.value?.token0,
          tokenB: addLiquidityPair.value?.token1
        });
      }
    });

    const showModal = computed({
      get: () => poolModalStore.show,
      set(newValue) {
        poolModalStore.togglePoolModal(newValue);
      }
    });

    const tabs = computed(() => poolModalStore.tabs);
    const currentNav = computed(() => poolModalStore.currentNav);

    const onSetting = () => {
      modalStore.toggleSlippageToleranceSettingsModal(true);
      slippageToleranceSettingsStore.updateCurrentSet("liquidity");
    };
    const onChange = (tab: Actions) => {
      poolModalStore.updateNav(tab);
    };

    const swapState = reactive<{
      showAddTokenModal: boolean
    }>({
      showAddTokenModal: false
    });

    const onAddToken = async () => {
      swapState.showAddTokenModal = true;
    };

    const confirmAddToken = async (address: string) => {
      console.log(`Input value is: ${address}`);

      const defaultProvider = new Provider({ network: "mainnet-alpha" });

      // const address = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
      const abi = [
        {
          "members": [
            {
              "name": "low",
              "offset": 0,
              "type": "felt"
            },
            {
              "name": "high",
              "offset": 1,
              "type": "felt"
            }
          ],
          "name": "Uint256",
          "size": 2,
          "type": "struct"
        },
        {
          "data": [
            {
              "name": "from_",
              "type": "felt"
            },
            {
              "name": "to",
              "type": "felt"
            },
            {
              "name": "value",
              "type": "Uint256"
            }
          ],
          "keys": [],
          "name": "Transfer",
          "type": "event"
        },
        {
          "data": [
            {
              "name": "owner",
              "type": "felt"
            },
            {
              "name": "spender",
              "type": "felt"
            },
            {
              "name": "value",
              "type": "Uint256"
            }
          ],
          "keys": [],
          "name": "Approval",
          "type": "event"
        },
        {
          "data": [
            {
              "name": "previousOwner",
              "type": "felt"
            },
            {
              "name": "newOwner",
              "type": "felt"
            }
          ],
          "keys": [],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "felt"
            },
            {
              "name": "symbol",
              "type": "felt"
            }
          ],
          "name": "constructor",
          "outputs": [],
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "name": "name",
              "type": "felt"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "name": "symbol",
              "type": "felt"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "name": "totalSupply",
              "type": "Uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "name": "decimals",
              "type": "felt"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "account",
              "type": "felt"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "name": "balance",
              "type": "Uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "felt"
            },
            {
              "name": "spender",
              "type": "felt"
            }
          ],
          "name": "allowance",
          "outputs": [
            {
              "name": "remaining",
              "type": "Uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "recipient",
              "type": "felt"
            },
            {
              "name": "amount",
              "type": "Uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "name": "success",
              "type": "felt"
            }
          ],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "sender",
              "type": "felt"
            },
            {
              "name": "recipient",
              "type": "felt"
            },
            {
              "name": "amount",
              "type": "Uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "name": "success",
              "type": "felt"
            }
          ],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "felt"
            },
            {
              "name": "amount",
              "type": "Uint256"
            }
          ],
          "name": "approve",
          "outputs": [
            {
              "name": "success",
              "type": "felt"
            }
          ],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "felt"
            },
            {
              "name": "added_value",
              "type": "Uint256"
            }
          ],
          "name": "increaseAllowance",
          "outputs": [
            {
              "name": "success",
              "type": "felt"
            }
          ],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "felt"
            },
            {
              "name": "subtracted_value",
              "type": "Uint256"
            }
          ],
          "name": "decreaseAllowance",
          "outputs": [
            {
              "name": "success",
              "type": "felt"
            }
          ],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "newOwner",
              "type": "felt"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "to",
              "type": "felt"
            },
            {
              "name": "amount",
              "type": "Uint256"
            }
          ],
          "name": "mint",
          "outputs": [],
          "type": "function"
        }
      ];
      const contract = new Contract(abi, address, defaultProvider);
      const name_result = await contract.call("name", []);
      const name = parseBN2String(name_result[0]);
      const symbol_result = await contract.call("symbol", []);
      const symbol = parseBN2String(symbol_result[0]);
      const decimals_result = await contract.call("decimals", []);
      const decimals = toRaw(decimals_result[0]).toNumber();
      if (!existToken(address)) {
        addToken(address, decimals, symbol, name);
      }
      // swapState.showAddTokenModal = false;
      // 将该组件内部需要进行的逻辑处理写在这里
    };

    const onSelectToken = (inputCurrency: Token) => {
      console.log("onSelectToken", inputCurrency);
      // AddLiquidity.changeToken();
      console.log("childComponentRef", childComponentRef.value);
      childComponentRef.value.changeToken(inputCurrency);

      // onCurrencySelection(Field.INPUT, inputCurrency);
    };

    return {
      showModal,
      tabs,
      currentNav,
      removeLiquidityPair,
      isMobile,
      Actions,
      AddTokenModal,
      swapState,
      childComponentRef,
      onSelectToken,
      onAddToken,
      confirmAddToken,

      onSetting,
      onChange,
      t
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/index.scss';

.l0k-swap-pair-modal-icon {
  cursor: pointer;
}
</style>
