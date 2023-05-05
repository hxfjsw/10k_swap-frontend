import { defineComponent } from 'vue'
import Svg from '../Svg.vue'
import { SvgProps } from '../types'

export default defineComponent({
  props: {
    ...SvgProps,
  },
  components: {
    Svg,
  },
  setup(props) {
    return () => (
      <Svg viewBox="0 0 12 12" {...props}>
        <path d="M1.40802 11.7584L10.2887 2.87777V10.5655C10.2887 11.0381 10.6718 11.4212 11.1443 11.4212C11.6169 11.4212 12 11.0381 12 10.5655V0.855657C12 0.383084 11.6169 -2.88504e-07 11.1444 1.86086e-05L1.43446 0C1.19817 1.89061e-05 0.984273 0.0957852 0.82944 0.250618C0.674607 0.405451 0.578822 0.61937 0.578822 0.855637C0.578822 1.32821 0.961925 1.71131 1.43448 1.71129L9.12227 1.71131L0.24158 10.592C-0.0805268 10.9141 -0.0805268 11.4363 0.24158 11.7584C0.563688 12.0805 1.08591 12.0805 1.40802 11.7584Z" />
      </Svg>
    )
  },
})
