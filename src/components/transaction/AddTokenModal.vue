<template>
  <Modal v-model="showModal">
    <template v-slot:header>
      <ModalHeader @dismiss="() => (showModal = false)" />
    </template>
    <div class="l0k-swap-transaction-rejected-modal">
      <div class="l0k-swap-currency-input-panel">
        <div class="inputs">
          <input type="text" v-model="inputValue" placeholder="input token address" />
        </div>
      </div>
      <br/>
      <Button class="confirm" @click="confirm" plain bold>
        Confirm
      </Button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import Modal from "../Modal/Modal.vue";
import ModalHeader from "../Modal/ModalHeader.vue";
import { ErrorIcon } from "../Svg/index";
import Text from "../Text/Text.vue";
import Button from "../Button/Button";

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
    Button
  },
  emits: ["dismiss", "confirm"],
  setup(props, { emit }) {
    const { show } = toRefs(props);
    const { t } = useI18n();
    //0x060cf64cf9edfc1b16ec903cee31a2c21680ee02fc778225dacee578c303806a
    const inputValue = ref(""); // 定义一个名为 inputValue 的 reactive 数据属性，并初始化为空字符串

    const showModal = computed({
      get: () => show.value,
      set(newValue) {
        if (!newValue) {
          emit("dismiss");
        }
      }
    });

    const confirm = function() {
      emit("confirm", inputValue.value);
    };

    return {
      showModal,
      confirm,
      inputValue,
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
</style>
