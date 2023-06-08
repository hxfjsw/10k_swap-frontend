<template>
  <Modal v-model="showModal">
    <template v-slot:header>
      <ModalHeader @dismiss="() => (showModal = false)" />
    </template>
    <div class="l0k-swap-transaction-rejected-modal">
      <div class="l0k-swap-currency-input-panel" style="  border: 1px solid orange;">
        <div class="inputs">
          <input type="text" v-model="inputValue" placeholder="Input contract address"
                 style="width: 350px;font-size: 14px;" v-on:keyup="handleInput">
        </div>
      </div>
      <br />

      <div class="l0k-swap-select-token--tokens" style="width: 90%">
        <div
          id="tokenlist"
          class="l0k-swap-select-token--token"
          v-for="token in tokens.list"
          :key="token.address"
          :title="token.name"
        >
          <TokenLogo class="l0k-swap-select-token--token-logo" :token="token" />
          <Text class="text"> {{ token.symbol }}</Text>
        </div>
      </div>
      <br />
      <!--      <Button class="confirm" @click="confirm" plain bold>-->
      <!--        Confirm-->
      <!--      </Button>-->
    </div>
  </Modal>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, toRaw, toRefs, watch  ,nextTick} from "vue";
import { useI18n } from "vue-i18n";
import Modal from "../Modal/Modal.vue";
import ModalHeader from "../Modal/ModalHeader.vue";
import { ErrorIcon } from "../Svg/index";
import Text from "../Text/Text.vue";
import Button from "../Button/Button";
import tokensList, { addToken, existToken } from "../../constants/tokens";
import { useStarknet } from "../../starknet-vue/providers/starknet";
import TokenLogo from "../TokenLogo/TokenLogo";
import { debounce } from "lodash";
import { Provider } from "starknet";
import { Contract } from "starknet/dist/contract/default";
import { parseBN2String } from "../../utils";
import { ChainId, Token } from "l0k_swap-sdk";

export default defineComponent({
  props: {
    show: {
      default: false,
      type: Boolean
    }
  },
  components: {
    Modal,
    ModalHeader,
    Text,
    ErrorIcon,
    Button,
    TokenLogo
  },
  emits: ["dismiss", "confirm"],
  setup(props, { emit }) {
    const { show } = toRefs(props);
    const { t } = useI18n();
    const inputValue = ref(""); // 定义一个名为 inputValue 的 reactive 数据属性，并初始化为空字符串

    const tokens = reactive<{
      list: Array<Token>;
    }>({
      list: tokensList[ChainId.MAINNET]
    });


    const refresh = async (address: string) => {
      const defaultProvider = new Provider({ network: "mainnet-alpha" });

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

    };

    const handleInput = async (event:any) => {
      const address = event.target.value;
      console.log("输入完成：", address);
      console.log(tokens.list.length);
      await refresh(address);
      await nextTick()
      tokens.list = tokensList[ChainId.MAINNET];
      console.log(tokens.list.length);
      await nextTick()
      inputValue.value=""

    };


    const showModal = computed({
      get: () => show.value,
      set(newValue) {
        if (!newValue) {
          emit("dismiss");
        }
      }
    });

    return {
      showModal,
      inputValue,
      handleInput,
      tokens,
      t
    };
  }
});
</script>

<style lang="scss">
@import '../../styles/index.scss';

.l0k-swap-transaction-rejected-modal {
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    margin-top: 16px;
    margin-bottom: 18px;
  }

  .dismiss {
    width: 140px;
  }
}

//.l0k-swap-currency-input-panel {
//  width: 90%;
//}
//.l0k-swap-modal-content{
//  width: 800px;
//}
</style>
