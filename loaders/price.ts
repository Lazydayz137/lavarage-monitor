import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Monitoring } from '../types/monitoring';

function getAllQTUniqueAddressFromActivePairsSet(monitor: Monitoring) {
  return Array.from(new Set(monitor.activePairsSet.map(pair => pair.QTAddress)))
}

// https://price.jup.ag/v6/price?ids=7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs&vsToken=So11111111111111111111111111111111111111112
function generateListOfPriceURLs(monitor: Monitoring) {
  return getAllQTUniqueAddressFromActivePairsSet(monitor).flatMap(QTAddress => {
    const allPairsUnderThisQtUniqueAddress = Array.from(new Set(monitor.activePairsSet.filter(pair => pair.QTAddress === QTAddress).map(pair => pair.BTAddress)))
    // split allPairsUnderThisQtUniqueAddress into chunks of 100
    const chunkedPairs = allPairsUnderThisQtUniqueAddress.reduce((resultArray: string[][], item, index) => {
      const chunkIndex = Math.floor(index / 100)
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }
      resultArray[chunkIndex].push(item)
      return resultArray
    }, [])
    return chunkedPairs.map(chunk => {
      return `https://price.jup.ag/v6/price?ids=${chunk.join(',')}&vsToken=${QTAddress}`
    })
  }
  )
}

export async function loadPrices(monitor: Monitoring) {
  const urls = generateListOfPriceURLs(monitor)
  try {
    const prices = await Promise.all(urls.map(async url => {
      const response = await fetch(url)
      return (await response.json()).data
    }))
    // join the Record<string, any> array into one Record object. modify all the keys of the record. originally its just the BT, now add the vsToken
    const allPrices = prices.reduce((acc, price) => {
  
      Object.keys(price).forEach(key => {
        acc[key + '-' + price[key].vsToken] = price[key]
      }
      )
      return acc
    }, {})
  
    monitor.activePairsSet?.forEach(pair => {
      try {
        pair.price = allPrices[pair.BTAddress + '-' + pair.QTAddress]!.price
      } catch (e) {
        console.log(pair.BTAddress, pair.QTAddress)
        console.log(e)
      }
    })
  
    monitor.positions = monitor.positions?.map(p => {
      // const interestAccrued = (pool.account.interestRate * p.account.amount / 100 * ((Date.now() / 1000 - p.account.timestamp) / 86400 + 1) / 365)
          
      return {
        ...p,
        ltv: p.amountInQT / (p.amountInBT * (monitor.activePairsSet.find(pair => pair.BTAddress == p.baseCoin.address && pair.QTAddress == p.quoteCoin.address)?.price || 0))
      }
    })
  } catch (e) {
    console.log(e)
  }
  

  setTimeout(() => loadPrices(monitor), 30000)
}
