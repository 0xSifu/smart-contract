// @dev. This script will deploy this V1.1 of Artix. It will deploy the whole ecosystem.

const { ethers } = require('hardhat')
const { BigNumber, ContractFactory } = ethers
const UniswapV2ABI = require('./IUniswapV2Factory.json').abi
const IUniswapV2Pair = require('./IUniswapV2Pair.json').abi
const UniswapV2RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const { getQuickSwapAddresses } = require('./addresses')

async function main() {
  const [deployer] = await ethers.getSigners()
  const daoAddr = '0xAc36272E4159Efe1160aafA57e578DF139A84C92'
  console.log('Deploying contracts with the account: ' + deployer.address)

  // Initial staking index
  const initialIndex = '1000000000'

  const { provider } = deployer
  // TODO: set this to launch date
  // const firstEpochTime = (await provider.getBlock()).timestamp + 30 * 60
  firstEpochTime = (await deployer.provider.getBlock()).timestamp - 100
  console.log('First epoch timestamp: ' + firstEpochTime)

  // What epoch will be first epoch
  const firstEpochNumber = '1'

  // How many seconds are in each epoch
  // const epochLengthInSeconds = 86400 / 3
  const epochLengthInSeconds = 60 * 10

  // Initial reward rate for epoch
  const initialRewardRate = '5000'

  // Ethereum 0 address, used when toggling changes in treasury
  const zeroAddress = '0x0000000000000000000000000000000000000000'

  // Large number for approval for DAI
  const largeApproval = '100000000000000000000000000000000'

  // Initial mint for DAI (10,000,000)
  const initialMint = '10000000000000000000000000'

  // DAI bond BCV
  const daiBondBCV = '300'

  // Bond vesting length in seconds.
  const bondVestingLength = 5 * 24 * 3600

  // Min bond price
  const minBondPrice = '1000'

  // Max bond payout, 1000 = 1% of ARTIX total supply
  const maxBondPayout = '1000'

  // DAO fee for bond
  const bondFee = '10000'

  // Max debt bond can take on
  const maxBondDebt = '8000000000000000'

  // Initial Bond debt
  const initialBondDebt = '0'

  const warmupPeriod = '3'

  const chainId = (await provider.getNetwork()).chainId
  console.log("GET CHAIN ID : "+ chainId)

  const { router: quickswapRouterAddr, factory: quickswapFactoryAddr } =
    getQuickSwapAddresses(chainId)

  const UniswapV2Router = ContractFactory.fromSolidity(
    UniswapV2RouterJson,
    deployer
  )
  const quickRouter = UniswapV2Router.attach(quickswapRouterAddr)

  const daiAddr =
    chainId === 43113
      ? '0x4C45E9e569cb43cd4c0769B17e840CF042898657'
      : '0x4C45E9e569cb43cd4c0769B17e840CF042898657'

  const usdcAddr =
    chainId === 43113
      ? '0xb6E26be97D62C043051A6Cdd5Bf6DC63A32192Ad'
      : '0xb6E26be97D62C043051A6Cdd5Bf6DC63A32192Ad'

  // Deploy DAI
  // const DAI = await ethers.getContractFactory('DAI')
  // const dai = DAI.attach(daiAddr)
  // await dai.mint(deployer.address, initialMint)
  // console.log('DAI addr: ' + dai.address)

  // Deploy USDC
  // const USDC = await ethers.getContractFactory('USDC')
  // const usdc = USDC.attach(usdcAddr)
  // await usdc.mint(deployer.address, initialMint)
  // console.log('USDC addr: ' + usdc.address)

  // // Deploy ARTIX
  // const ARTIX = await ethers.getContractFactory('ArtixERC20')
  // const artix = await ARTIX.deploy()
  // console.log('ARTIX deployed: ' + artix.address)

  // // Deploy Circulating Supply
  // const ArtixCirculatingSupply = await ethers.getContractFactory(
  //   'ArtixCirculatingSupply'
  // )
  // const artixCirculatingSupply = await ArtixCirculatingSupply.deploy(
  //   deployer.address
  // )
  // console.log('ARTIX circulating Supply: ' + artixCirculatingSupply.address)

  // // Initialize CirculatingSupply
  // await artixCirculatingSupply.deployTransaction.wait()
  // await artixCirculatingSupply.initialize(artix.address)
  // console.log('Initialize Circulating Supply has been done!')

  // // Initialize UniswapFactory
  // const uniswapFactory = new ethers.Contract(
  //   quickswapFactoryAddr,
  //   UniswapV2ABI,
  //   deployer
  // )
  // console.log(deployer.address);
  // console.log('Initialize UniswapV2Factory has been done!')
 
  // // Deploy LP
  // await (await uniswapFactory.createPair(artix.address, dai.address)).wait()
  // const lpAddress = await uniswapFactory.getPair(artix.address, dai.address)
  // console.log('get pair: ' + lpAddress)

  // // Deploy bonding calc
  // const BondingCalculator = await ethers.getContractFactory(
  //   'ArtixBondingCalculator'
  // )
  // const bondingCalculator = await BondingCalculator.deploy(artix.address)

  // // Deploy treasury
  // const Treasury = await ethers.getContractFactory('ArtixTreasury')
  // const treasury = await Treasury.deploy(
  //   artix.address,
  //   dai.address,
  //   lpAddress,
  //   bondingCalculator.address,
  //   0
  // )
  // console.log('treasury deployed: ' + treasury.address)

  // // Deploy staking distributor
  // const StakingDistributor = await ethers.getContractFactory(
  //   'ArtixStakingDistributor'
  // )

  // const stakingDistributor = await StakingDistributor.deploy(
  //   treasury.address,
  //   artix.address,
  //   epochLengthInSeconds,
  //   firstEpochTime
  // )
  // console.log('Staking Distributor: ' + stakingDistributor.address)

  // // Deploy sARTIX
  // const StakedARTIX = await ethers.getContractFactory('StakedArtixERC20')
  // const sARTIX = await StakedARTIX.deploy()
  // console.log('sARTIX: ' + sARTIX.address)

  // // Deploy Staking
  // const Staking = await ethers.getContractFactory('ArtixStaking')
  // const staking = await Staking.deploy(
  //   artix.address,
  //   sARTIX.address,
  //   epochLengthInSeconds,
  //   firstEpochNumber,
  //   firstEpochTime
  // )
  // console.log('STAKING: ' + staking.address)

  // // Deploy staking warmpup
  // const StakingWarmup = await ethers.getContractFactory('ArtixStakingWarmup')
  // const stakingWarmup = await StakingWarmup.deploy(
  //   staking.address,
  //   sARTIX.address
  // )
  // console.log('Staking Warmup: ' + stakingWarmup.address)

  // // Deploy staking helper
  // const StakingHelper = await ethers.getContractFactory('ArtixStakingHelper')
  // const stakingHelper = await StakingHelper.deploy(
  //   staking.address,
  //   artix.address
  // )
  // console.log('Staking Helper: ' + stakingHelper.address)

  // // Deploy DAI bond
  // const DAIBond = await ethers.getContractFactory('ArtixBondDepository')
  // const daiBond = await DAIBond.deploy(
  //   artix.address,
  //   dai.address,
  //   treasury.address,
  //   daoAddr,
  //   zeroAddress
  // )
  // console.log('DAI BOND: ' + daiBond.address)

  // // Deploy DAI-ARTIX BOND
  // const DaiArtixBond = await ethers.getContractFactory('ArtixBondDepository')
  // const daiArtixBond = await DaiArtixBond.deploy(
  //   artix.address,
  //   lpAddress,
  //   treasury.address,
  //   daoAddr,
  //   bondingCalculator.address
  // )
  // console.log('DAI-ARTIX BOND: ' + daiArtixBond.address)

  // // Deploy IDO
  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = await IDO.deploy(
  //   artix.address,
  //   daiAddr,
  //   treasury.address,
  //   staking.address,
  //   lpAddress
  // )
  // console.log('IDO: ' + ido.address)

  // console.log(
  //   JSON.stringify({
  //     sARTIX_ADDRESS: sARTIX.address,
  //     ARTIX_ADDRESS: artix.address,
  //     MAI_ADDRESS: dai.address,
  //     TREASURY_ADDRESS: treasury.address,
  //     ARTIX_BONDING_CALC_ADDRESS: bondingCalculator.address,
  //     STAKING_ADDRESS: staking.address,
  //     STAKING_HELPER_ADDRESS: stakingHelper.address,
  //     RESERVES: {
  //       MAI: dai.address,
  //       MAI_ARTIX: lpAddress,
  //     },
  //     BONDS: {
  //       MAI: daiBond.address,
  //       MAI_ARTIX: daiArtixBond.address,
  //     },
  //     IDO: ido.address,
  //     ARTIX_CIRCULATING_SUPPLY: artixCirculatingSupply.address,
  //   })
  // )

  // // queue and toggle DAI reserve depositor
  // await (await treasury.queue('0', daiBond.address)).wait()
  // await treasury.toggle('0', daiBond.address, zeroAddress)

  // await (await treasury.queue('0', deployer.address)).wait()
  // await treasury.toggle('0', deployer.address, zeroAddress)
  // console.log('Queue and toggle DAI reserve depositor has been done!')


  // // queue and toggle DAI-ARTIX liquidity depositor
  // await (await treasury.queue('4', daiArtixBond.address)).wait()
  // await treasury.toggle('4', daiArtixBond.address, zeroAddress)

  // await (await treasury.queue('4', deployer.address)).wait()
  // await treasury.toggle('4', deployer.address, zeroAddress)
  // console.log('Queue and toggle DAI-ARTIX liquidity depositor has been done!')

  // // Set bond terms
  // await daiBond.initializeBondTerms(
  //   daiBondBCV,
  //   bondVestingLength,
  //   minBondPrice,
  //   maxBondPayout,
  //   bondFee,
  //   maxBondDebt,
  //   initialBondDebt
  // )
  // await daiArtixBond.initializeBondTerms(
  //   '100',
  //   bondVestingLength,
  //   minBondPrice,
  //   maxBondPayout,
  //   bondFee,
  //   maxBondDebt,
  //   initialBondDebt
  // )
  // console.log('Set bond terms has been done!')

  // // Set staking for bonds
  // await daiBond.setStaking(staking.address, stakingHelper.address)
  // await daiArtixBond.setStaking(staking.address, stakingHelper.address)
  // console.log('Set staking for bonds has been done!')

  // // Initialize sARTIX and set the index
  // await sARTIX.initialize(staking.address)
  // await sARTIX.setIndex(initialIndex)
  // console.log('Initialize sARTIX and set the index has been done!')


  // // set distributor contract and warmup contract
  // await staking.setContract('0', stakingDistributor)
  // await staking.setContract('1', stakingWarmup)
  // await staking.setWarmup(warmupPeriod)
  // console.log('Set distributor contract and warmup contract has been done!')

  // // Set treasury for ARTIX token
  // await artix.setVault(treasury.address)
  // console.log('Set treasury for ARTIX token has been done!')

  // // Add staking contract as distributor recipient
  // await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  // console.log('Add staking contract as distributor recipient has been done!')

  // // queue and toggle reward manager
  // await (await treasury.queue('8', stakingDistributor.address)).wait(1)
  // await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  // console.log('Queue and toggle reward manager has been done!')

  // const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // // Approve the treasury to spend DAI
  // await Promise.all([
  //   (await dai.approve(treasury.address, largeApproval)).wait(),
  //   (await dai.approve(daiBond.address, largeApproval)).wait(),
  //   (await dai.approve(quickRouter.address, largeApproval)).wait(),
  //   (await artix.approve(staking.address, largeApproval)).wait(),
  //   (await artix.approve(stakingHelper.address, largeApproval)).wait(),
  //   (await artix.approve(quickRouter.address, largeApproval)).wait(),
  //   (await lp.approve(treasury.address, largeApproval)).wait(),
  // ])
  // console.log('Approve the treasury to spend DAI has been done!')
  // const totalIDODaiAmount = 100 * 10000
  // const artixMinted = 200000
  // const lpArtixAmount = 50000
  // const initialArtixPriceInLP = 15
  // const daiInTreasury = totalIDODaiAmount - initialArtixPriceInLP * lpArtixAmount
  // const profit = daiInTreasury - artixMinted - lpArtixAmount
  // console.log({ daiInTreasury, profit })

  // await (
  //   await treasury.deposit(
  //     ethers.utils.parseEther(String(daiInTreasury)),
  //     dai.address,
  //     BigNumber.from(profit).mul(1e9)
  //   )
  // ).wait()
  // console.log('Deposit DAI in Treasury has been done!')
  
  // // mint lp
  // await (
  //   await quickRouter.addLiquidity(
  //     dai.address,
  //     artix.address,
  //     ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
  //     ethers.utils.parseUnits(String(lpArtixAmount), 9),
  //     ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
  //     ethers.utils.parseUnits(String(lpArtixAmount), 9),
  //     deployer.address,
  //     1000000000000
  //   )
  // ).wait()
  // console.log('Mint LP has been done!')

  // // deposit lp with full profit
  // const lpBalance = await lp.balanceOf(deployer.address)
  // const valueOfLPToken = await treasury.valueOfToken(lpAddress, lpBalance)
  // await treasury.deposit(lpBalance, lpAddress, valueOfLPToken)
  // console.log('Deposit lp with full profit has been done!')
    const test = 2
  // // Stake ARTIX through helper
  // await stakingHelper.stake(
    console.log(BigNumber.from(test).mul(BigNumber.from(10).pow(9)))
  // )

  // // Bond 1,000 ARTIX in each of their bonds
  //   await daiBond.deposit("1000000000000000000000", "60000", deployer.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


  