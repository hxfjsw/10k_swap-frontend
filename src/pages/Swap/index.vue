<template>
  <Page class="l0k-swap-swap-wrapper" :title="t('swap.title')">
    <template v-slot:head-right>
      <!--      <QueryIcon class="setting" width="17px" @click="onAddToken" style="margin-right: 10px" />-->
      <a href="javascript:;">
        <img src="./query.png" style="width: 17px;height: 17px;margin-right: 10px" @click="onAddToken" />
      </a>
      <SettingIcon class="setting" width="17px" @click="onSetting" />
    </template>
    <div class="l0k-swap-swap-content">
      <CurrencyInputPanel :value="formattedAmounts[Field.INPUT]" :token="currencies[Field.INPUT]"
                          :currencyBalance="currencyBalances[Field.INPUT]" :onMax="onMax" @token-select="onInputSelect"
                          @input="handleTypeInput" />
      <div class="switch-wrap">
        <!--        <SwitchIcon class="switch" @click="onSwitch" />-->
        <img src="./img/btn.png" alt="" class="btn" @click="onSwitch">
      </div>
      <CurrencyInputPanel :value="formattedAmounts[Field.OUTPUT]" :token="currencies[Field.OUTPUT]"
                          :currencyBalance="currencyBalances[Field.OUTPUT]" @token-select="onOutputSelect"
                          @input="handleTypeOutput" />
      <div class="swap-info">
        <div class="loading" v-if="loadingTrade">
          <LoadingIcon class="icon" :color="'minor'" width="12px" />
          <Text :color="'description-text'" :size="'mini'">
            {{ t("swap.fetching") }}
          </Text>
        </div>
        <div class="info" v-else-if="v2Trade">
          <TradePrice :price="v2Trade.executionPrice" />
          <AdvancedSwapDetails :trade="v2Trade" />
        </div>
      </div>
      <div class="swap">
        <Button :type="'primary'" :size="'large'" bold v-if="!account" @click="openWalletModal">
          {{ t("connect") }}
        </Button>
        <Button :type="'primary'" :size="'large'" bold disabled v-else-if="noTrade && userHasSpecifiedInputOutput">
          {{ t("swap.insufficient_liquidity") }}
        </Button>
        <Button :type="'primary'" :size="'large'" bold v-else @click="onSwapClick"
                :disabled="!isValid || loadingTrade || !v2Trade || (tradeToConfirm && !!swapCallbackError)">
          {{ !isValid ? swapInputError : t("swap.swap") }}
        </Button>
      </div>
    </div>
  </Page>
  <ConfirmModal :show="swapState.showConfirm" :trade="tradeToConfirm" @swap="handleSwap"
                @dismiss="swapState.showConfirm = false" />
  <WaittingModal :show="swapState.attemptingTxn" :desc="summary" @dismiss="swapState.attemptingTxn = false" />
  <RejectedModal :show="showRejectedModal" @dismiss="onReset" />
  <ScuccessModal :show="!!swapState.txHash" :tx="swapState.txHash" @dismiss="onReset" />
  <AddTokenModal :show="swapState.showAddTokenModal" @dismiss="swapState.showAddTokenModal=false"
                 @confirm="confirmAddToken" @select_token="onSelectToken" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import Text from "../../components/Text/Text.vue";
import Button from "../../components/Button/Button";
import Page from "../../components/Page/Page.vue";
import CurrencyInputPanel from "../../components/CurrencyInputPanel/index.vue";
import TradePrice from "../../components/swap/TradePrice.vue";
import AdvancedSwapDetails from "../../components/swap/AdvancedSwapDetails.vue";
import ConfirmModal from "../../components/swap/ConfirmModal.vue";
import WaittingModal from "../../components/transaction/WaittingModal.vue";
import RejectedModal from "../../components/transaction/RejectedModal.vue";
import ScuccessModal from "../../components/transaction/ScuccessModal.vue";
import AddTokenModal from "../../components/transaction/AddTokenModal.vue";
import { SettingIcon, SwitchIcon, LoadingIcon, AddIcon, QueryIcon } from "../../components/Svg";
import { Token, Trade, JSBI, TokenAmount } from "l0k_swap-sdk";
import { useModalStore, useSlippageToleranceSettingsStore } from "../../state";
import { useDerivedSwapInfo, useSwapActionHandlers } from "../../state/swap/hooks";
import { useSwapStore } from "../../state/swap";
import { Field } from "../../state/swap/types";
import useSwapCallback from "../../hooks/useSwapCallback";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import { useUserSwapSlippageTolerance } from "../../state/slippageToleranceSettings/hooks";
import useSwapSummary from "../../hooks/useSwapSummary";
import { useOpenWalletModal } from "../../state/modal/hooks";
import { getDeductGasMaxAmount, parseBN2String } from "../../utils";
import { addToken, existToken } from "../../constants/tokens";
import { useTokenContract } from "../../hooks/Contract";
import { useStarknetCall } from "../../starknet-vue/hooks/call";
import { useToken } from "../../hooks/Tokens";
import { constants, Contract, RpcProvider } from "starknet5";

export default defineComponent({
  components: {
    Text,
    Button,
    Page,
    AddIcon,
    QueryIcon,
    SettingIcon,
    CurrencyInputPanel,
    SwitchIcon,
    LoadingIcon,
    TradePrice,
    AdvancedSwapDetails,
    ConfirmModal,
    WaittingModal,
    RejectedModal,
    ScuccessModal,
    AddTokenModal
  },
  setup() {
    const { t } = useI18n();
    const modalStore = useModalStore();
    const openWalletModal = useOpenWalletModal();
    const slippageToleranceSettingsStore = useSlippageToleranceSettingsStore();
    const userSwapSlippageTolerance = useUserSwapSlippageTolerance();
    const {
      state: { account }
    } = useStarknet();

    // swap state
    const swapStore = useSwapStore();
    const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo();
    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();
    const independentField = computed(() => swapStore.independentField);
    const isValid = computed(() => !swapInputError.value);
    const dependentField = computed(() => (independentField.value === Field.INPUT ? Field.OUTPUT : Field.INPUT));

    const parsedAmounts = computed(() => ({
      [Field.INPUT]: independentField.value === Field.INPUT ? parsedAmount.value : v2Trade.value?.inputAmount,
      [Field.OUTPUT]: independentField.value === Field.OUTPUT ? parsedAmount.value : v2Trade.value?.outputAmount
    }));
    const formattedAmounts = computed(() => ({
      [independentField.value]: swapStore.typedValue,
      [dependentField.value]: parsedAmounts.value[dependentField.value]?.toSignificant(6) ?? ""
    }));
    const userHasSpecifiedInputOutput = computed(() =>
      Boolean(
        currencies.value[Field.INPUT] && currencies.value[Field.OUTPUT] && parsedAmounts.value[independentField.value]?.greaterThan(JSBI.BigInt(0))
      )
    );
    const noRoute = computed(() => !v2Trade.value?.route);
    const noTrade = computed(() => v2Trade.value === undefined);
    const loadingTrade = computed(() => v2Trade.value === null);
    const showRejectedModal = computed(() => !!swapState.swapErrorMessage && swapState.swapErrorMessage.includes("User abort"));

    const confirmAddToken = async (address: string) => {
      console.log(`Input value is: ${address}`);

      // const defaultProvider = new Provider({ network: "mainnet-alpha" });
      const defaultProvider = new RpcProvider({nodeUrl: constants.NetworkName.SN_MAIN});


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
      const name_result = (await contract.call("name", [])) as bigint[];
      const name = parseBN2String(name_result[0]);
      const symbol_result = (await contract.call("symbol", [])) as bigint[];
      const symbol = parseBN2String(symbol_result[0]);
      const decimals_result = (await contract.call("decimals", [])) as bigint[];
      const decimals = (Number)(decimals_result[0]);
      if (!existToken(address)) {
        addToken(address, decimals, symbol, name);
      }
      // swapState.showAddTokenModal = false;
      // 将该组件内部需要进行的逻辑处理写在这里
    };

    const tradeToConfirm = ref<Trade>();
    const swapState = reactive<{
      showAddTokenModal: boolean
      showConfirm: boolean
      attemptingTxn: boolean
      swapErrorMessage: string | undefined
      txHash: string | undefined
    }>({
      showAddTokenModal: false,
      showConfirm: false,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      txHash: undefined
    });

    const summary = useSwapSummary(tradeToConfirm);
    const swapCallbacks = useSwapCallback(tradeToConfirm, userSwapSlippageTolerance);
    const swapCallbackError = computed(() => swapCallbacks.value.error);

    const handleTypeInput = (value: string | number) => {
      onUserInput(Field.INPUT, value);
    };
    const handleTypeOutput = (value: string | number) => {
      onUserInput(Field.OUTPUT, value);
    };
    const onSetting = () => {
      modalStore.toggleSlippageToleranceSettingsModal(true);
      slippageToleranceSettingsStore.updateCurrentSet("swap");
    };
    const onAddToken = async () => {
      swapState.showAddTokenModal = true;
    };
    const onInputSelect = (inputCurrency: Token) => {
      onCurrencySelection(Field.INPUT, inputCurrency);
    };
    const onOutputSelect = (inputCurrency: Token) => {
      onCurrencySelection(Field.OUTPUT, inputCurrency);
    };
    const onSwitch = () => {
      onSwitchTokens();
    };
    const onSwapClick = () => {
      if (!v2Trade.value) {
        return;
      }
      swapState.showConfirm = true;
      tradeToConfirm.value = v2Trade.value;
    };

    const handleSwap = () => {
      if (!swapCallbacks.value.callback) {
        return;
      }
      swapState.showConfirm = false;
      swapState.attemptingTxn = true;

      swapCallbacks.value
        .callback()
        .then((hash) => {
          swapState.attemptingTxn = false;
          swapState.txHash = hash;
        })
        .catch((error) => {
          swapState.attemptingTxn = false;
          swapState.txHash = undefined;
          swapState.swapErrorMessage = error.message;
        });
    };

    const onReset = () => {
      if (swapState.txHash) {
        onUserInput(Field.INPUT, "");
      }
      swapState.showConfirm = false;
      tradeToConfirm.value = undefined;
      swapState.attemptingTxn = false;
      swapState.swapErrorMessage = undefined;
      swapState.txHash = undefined;
    };

    const onMax = (maxInputAmount: TokenAmount | undefined) => {
      const amount = getDeductGasMaxAmount(maxInputAmount);
      if (amount) {
        onUserInput(Field.INPUT, amount.toExact());
      }
    };

    const onSelectToken = (inputCurrency: Token) => {
      console.log("onSelectToken", inputCurrency);
      onCurrencySelection(Field.INPUT, inputCurrency);
    };

    return {
      swapState,
      Field,
      isValid,
      v2Trade,
      summary,
      account,
      noRoute,
      noTrade,
      loadingTrade,
      formattedAmounts,
      currencies,
      currencyBalances,
      userHasSpecifiedInputOutput,
      swapInputError,
      swapCallbackError,
      showRejectedModal,
      tradeToConfirm,
      onSelectToken,
      t,
      onSetting,
      onInputSelect,
      openWalletModal,
      onAddToken,
      onSwitch,
      onOutputSelect,
      onSwapClick,
      onReset,
      onMax,
      handleTypeInput,
      handleTypeOutput,
      handleSwap,
      confirmAddToken
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/index.scss';

.l0k-swap-swap-wrapper {
  margin-top: 28px;

  .setting {
    cursor: pointer;
  }

  .l0k-swap-swap-content {
    padding: 0 20px 20px 20px;
    position: relative;

    .switch-wrap {
      position: relative;
      height: 12px;
      cursor: pointer;

      .btn {
        width: 50px;
        height: 50px;
        position: absolute;
        top: -94%;
        left: 44%;
      }

      .switch {
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
      }
    }

    .swap-info {
      margin-top: 13px;

      .loading {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 6px;
        }
      }
    }

    .swap {
      display: flex;
      margin-top: 20px;
    }
  }

  @include mobile {
    margin-top: 5px;
  }
}
</style>
