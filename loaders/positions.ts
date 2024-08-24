// loads positions from memory. if there aren't any, load from blockchain using anchor
// using postgres triggers, automatically update positions in memory
import anchor, { AnchorProvider, Program, web3, } from '@coral-xyz/anchor';
import { Lavarage, IDL } from '../idl/lavarage'
import { Monitoring } from '../types/monitoring';
import BigNumber from 'bignumber.js';
import bs58 from 'bs58';
import { loadPoolsFromAnchor } from './pools';

const EDGE_CASE_TIMESTAMPS = [
  { start: 1713880000, end: 1713885480 }, // 10:32 AM - 10:58 AM ET on April 23, 2024
  { start: 1713874500, end: 1713876060 }, // 8:15 AM - 8:41 AM ET on April 23, 2024
]

function isWithinEdgeCaseTimeRange(closeTimestamp: number) {
  return EDGE_CASE_TIMESTAMPS.some(({ start, end }) => closeTimestamp >= start && closeTimestamp <= end)
}

export async function loadPositionsFromAnchor(programIdAddress: string, provider: AnchorProvider, monitor: Monitoring) {
  // Load the anchor program from the IDL
  const programId = new web3.PublicKey(programIdAddress);
  const program = new Program<Lavarage>(IDL, programId, provider); // Fix: Change 'Lavarage' to 'Idl'

  // Rest of your code...
  const value = BigInt(9999)
  const valueBuffer = Buffer.alloc(8)
  valueBuffer.writeBigUInt64LE(value, 0)
  const poolsObj = (await loadPoolsFromAnchor(program))
  const pools = poolsObj.map(p => p.publicKey.toBase58())
  // Return the loaded positions
  const positions = ((await program.account.position.all([
    { dataSize: 178 },
    {
      memcmp: {
        offset: 40,
        bytes: bs58.encode(Buffer.from(new Uint8Array(8))),
      },
    },
  ])
  ).concat(
    (await program.account.position.all([
      { dataSize: 178 },
      {
        memcmp: {
          offset: 40,
          bytes: bs58.encode(valueBuffer),
        },
      },
    ])).filter(({ account }) => isWithinEdgeCaseTimeRange(account.closeTimestamp.toNumber())))).filter(({ account }) => pools.includes(account.pool.toBase58()))
  monitor.positions = positions.map(({ account }) => {
    return {
      baseCoin: {
        name: '',
        address: ''
      },
      quoteCoin: {
        name: '',
        address: ''
      },
      ltv: 0,
      // TODO: now is SOL, need to convert to QT decimals later
      amountInQT: new BigNumber(account.amount.toString()).div(1e9).toNumber(),
      amountInBT: 0,
    }
  }
  )
  monitor.activePairsSet = positions
  .map(({ account }) => account.pool.toBase58())
  .map((poolAddr) => {
    const poolThis = poolsObj.find(p => p.publicKey.toBase58() === poolAddr)!
    return {
      BTAddress: poolThis.account.collateralType.toBase58(),
      // TODO: now is SOL, need to convert to QT address later
      QTAddress: 'So11111111111111111111111111111111111111112',
      price: 0
    }
  })
}
