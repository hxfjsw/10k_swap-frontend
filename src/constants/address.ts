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
  [ChainId.MAINNET]: '0x013e13b71de66832b5d22360579a225896c8ddb49631169b16e49c6e6b480288',
  [ChainId.TESTNET]: '0x013e13b71de66832b5d22360579a225896c8ddb49631169b16e49c6e6b480288',
}
