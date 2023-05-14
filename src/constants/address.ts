import { ChainId } from 'l0k_swap-sdk'

export const ROUTER_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: '0x07ebd0e95dfc4411045f9424d45a0f132d3e40642c38fdfe0febacf78cc95e76',
  [ChainId.TESTNET]: '0x027d32f6c2b45c6d9fad20c7e07068061fb593e5d934058cca30bf41839b9306',
}

export const STARKNET_ID_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: '0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678',
  [ChainId.TESTNET]: '0x05cf267a0af6101667013fc6bd3f6c11116a14cda9b8c4b1198520d59f900b17',
}
