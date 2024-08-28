export type Monitoring = {
  meta: {
    liquidationGasRemain: number
    oracleGasRemain: number
    utilization: number
    deployed: number
    openedPositions: number
  },
  positions: Position[],
  activePairsSet: Pair[]
}

export type Position = {
  address: string
  baseCoin: Coin
  quoteCoin: Coin
  ltv: number
  amountInQT: number
  amountInBT: number
  elapsed: number
  lastInterestCollectionElapsed: number
  interestRate: number
}

// TODO: add qt usd price and bt usd price
type Pair = {
  BTAddress: string,
  QTAddress: string,
  price: number
}

type Coin = {
  name: string
  address: string
}