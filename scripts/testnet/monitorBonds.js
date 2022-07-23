const { ethers } = require('hardhat')
const IUniswapV2Pair = require('./IUniswapV2Pair.json').abi

const priceFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'usd',
})

const CTXT_DAI_LP = '0x83DEAD8d530E8F39B548Dac1346d334c3e4D3EcC'

async function main() {
  const ContextBondDepository = await ethers.getContractFactory(
    'ContextBondDepository'
  )
  const bonds = [
    { name: 'DAI', address: '0x446e00F406E98125dd791b3f20fA1Ca840a690d3' },
    { name: 'CTXT-DAI', address: '0x9f11D17e3b971d7873efe2694E68B5d6CE365dE8' },
  ]

  for (const { name, address } of bonds) {
    const bond = ContextBondDepository.attach(address)
    await fetchBondInfo(name, bond)
    bond.on('BondCreated', async (deposit, payout, _, priceInUSD) => {
      console.log(`==== New Bond ${name} created! ==== ` + new Date())
      console.log(
        JSON.stringify(
          {
            deposit: ethers.utils.formatEther(deposit),
            payout: ethers.utils.formatUnits(payout, 9),
            bondPrice: priceFormatter.format(
              ethers.utils.formatEther(priceInUSD)
            ),
            total: priceFormatter.format(
              ethers.utils.formatEther(payout.mul(priceInUSD).div(1e9))
            ),
          },
          null,
          2
        )
      )
      console.log(`=================================== ` + new Date())
    })
  }

  setInterval(async () => {
    console.log('==== ' + new Date())
    for (const { name, address } of bonds) {
      const bond = ContextBondDepository.attach(address)
      await fetchBondInfo(name, bond)
    }
  }, 60 * 1000)
}

async function fetchBondInfo(name, bond) {
  const marketPrice = Number(
    ethers.utils.formatUnits(await getMarketPrice(), 9)
  )
  const [terms, debtRatio, price, adjustment] = await Promise.all([
    bond.terms(),
    bond.standardizedDebtRatio(),
    bond.bondPriceInUSD(),
    bond.adjustment(),
  ])
  const bondPrice = Number(ethers.utils.formatEther(price))
  console.log(
    JSON.stringify(
      {
        name,
        marketPrice: priceFormatter.format(marketPrice),
        bondPrice: priceFormatter.format(bondPrice),
        bcv: terms[0].toString(),
        adjustment: `${
          adjustment[0] ? '+' : '-'
        }${adjustment[1].toString()} target: ${adjustment[2].toString()} buffer: ${adjustment[3].toString()}`,
        debtRatio:
          name === 'DAI' || name === 'FRAX'
            ? ethers.utils.formatUnits(debtRatio, 7) + '%'
            : ethers.utils.formatUnits(debtRatio, 16) + '%',
        ROI: Intl.NumberFormat('en', {
          style: 'percent',
          minimumFractionDigits: 2,
        }).format((marketPrice - bondPrice) / bondPrice),
      },
      null,
      2
    )
  )
}

async function getMarketPrice() {
  const signer = await ethers.getSigner()
  const lp = new ethers.Contract(CTXT_DAI_LP, IUniswapV2Pair, signer)
  const reserves = await lp.getReserves()
  const marketPrice = reserves[0].div(reserves[1])
  return marketPrice
}

main()
  // .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    // process.exit(1)
  })
