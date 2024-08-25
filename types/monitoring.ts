export type Monitoring = {
  meta: {
    liquidationGasRemain: number
    oracleGasRemain: number
    utilization: number
    deployed: number
    openedPositions: number
  },
  positions: {
    baseCoin: Coin
    quoteCoin: Coin
    ltv: number
    amountInQT: number
    amountInBT: number
    elapsed: number
    lastInterestCollectionElapsed: number
  }[]
  activePairsSet: Pair[]
}

type Pair = {
  BTAddress: string,
  QTAddress: string,
  price: number
}

type Coin = {
  name: string
  address: string
}