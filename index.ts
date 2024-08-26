import { AnchorProvider, Wallet } from "@coral-xyz/anchor"
import useEffects from "./lib/useEffects"
import { monitorAccountBalance } from "./loaders/accountBalance"
import { loadPositionsFromAnchor } from "./loaders/positions"
import { Monitoring } from "./types/monitoring"
import { Connection, Keypair } from "@solana/web3.js"
import { listen, sendEventsToAll } from "./express"
import { loadPrices } from "./loaders/price"
import { loadTokenList, Token } from "./loaders/tokenList"

const provider = new AnchorProvider(new Connection('https://solana-mainnet.g.alchemy.com/v2/yTBaNPPya9CJDsgBHq-dg89gpjzbFzbQ'), new Wallet(Keypair.generate()), {})

export const monitor: Monitoring = {
  meta: {
    liquidationGasRemain: 0,
    utilization: 0,
    deployed: 0,
    oracleGasRemain: 0,
    openedPositions: 0,
  },
  positions: [],
  activePairsSet: []
}

const tokenList: Token[] = [
]

loadTokenList(tokenList).then(() => {
  monitorAccountBalance('bkhAyULeiXwju7Zmy4t3paDHtVZjNaofVQ4VgEdTWiE', 'oracleGasRemain', monitor)
  monitorAccountBalance('BFeh7vYjH9TDLUzosbCKfQQgxDW4eQzVezw8FFbmM7mt', 'liquidationGasRemain', monitor)
  monitorAccountBalance('6riP1W6R3qzUPWYwLGtXEC23aTqmyAEdDtXzhntJquAh', 'deployed', monitor)

  useEffects('monitor', () => {
    sendEventsToAll(monitor)
  }, monitor)

  // monitor 
  useEffects('deployed', async () => {
    // when deployed changes, update utilization
    await loadPositionsFromAnchor('CRSeeBqjDnm3UPefJ9gxrtngTsnQRhEJiTA345Q83X3v', provider, monitor, tokenList)
    monitor.meta.utilization = monitor.positions.reduce((acc, { amountInQT }) => acc + amountInQT, 0)
    monitor.meta.openedPositions = monitor.positions.length
  }, monitor.meta, 'deployed')

  loadPrices(monitor)


})
listen()
