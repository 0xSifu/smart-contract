// @dev. This script will deploy this V1.1 of Artix. It will deploy the whole ecosystem.

const { ethers } = require('hardhat')
const { BigNumber, ContractFactory } = ethers
const UniswapV2ABI = require('./IUniswapV2Factory.json').abi
const IUniswapV2Pair = require('./IUniswapV2Pair.json').abi
const UniswapV2RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const { getQuickSwapAddresses } = require('./addresses')

async function main() {
  const [deployer] = await ethers.getSigners()
  const daoAddr = '0xAc36272E4159Efe1160aafA57e578DF139A84C92' //multisig wallet
  console.log('Deploying contracts with the account: ' + deployer.address)

  // Initial staking index
  const initialIndex = '1000000000'

  const { provider } = deployer
  // TODO: set this to launch date
  const firstEpochTime = (await provider.getBlock()).timestamp + 30 * 60
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

  const { router: quickswapRouterAddr, factory: quickswapFactoryAddr } =
    getQuickSwapAddresses(chainId)

  const UniswapV2Router = ContractFactory.fromSolidity(
    UniswapV2RouterJson,
    deployer
  )
  const quickRouter = UniswapV2Router.attach(quickswapRouterAddr)

  // const dai.address =
  //   chainId === 43113
  //     ? '0xE2A327FCc16bDa0549DB7A77791eAdE13774434e'
  //     : '0xE2A327FCc16bDa0549DB7A77791eAdE13774434e'

  // const dai.address =
  //   chainId === 43113
  //     ? '0x9d37Fd9Bc60E13a587D73DE0A3396235cfBfB7C4'
  //     : '0x9d37Fd9Bc60E13a587D73DE0A3396235cfBfB7C4'
    const artix = "0x2365b7d89c9ff68ADDE2449CC4a2732A8E9ec944";
    const dai = "0xc1669a6D70dCfc9bec583c5C7CfF247003155D02";
  // Deploy DAI
  const DAI = await ethers.getContractFactory('DAI')
  // const DAI = await ethers.getContractFactory('USDC')
  // const dai = await DAI.deploy('18');
  const dai_addr = DAI.attach(dai);
  // await dai.mint(deployer.address, initialMint)
  // console.log('DAI addr: ' + dai.address)

  // Deploy ARTIX
  // const ARTIX = await ethers.getContractFactory('ArtixERC20')
  // const artix = await ARTIX.deploy()
  // console.log('ARTIX deployed: ' + artix.address)

  // // Deploy Circulating Supply
  // const ArtixCirculatingSupply = await ethers.getContractFactory('ArtixCirculatingSupply')
  // const artixCirculatingSupply = await ArtixCirculatingSupply.deploy(deployer.address)
  // console.log('Artix CirculatingSupply: ' +artixCirculatingSupply.address);
  // await artixCirculatingSupply.deployTransaction.wait()
  // await artixCirculatingSupply.initialize(artix.address)

  // // Deploy LP
  // const uniswapFactory = new ethers.Contract(
  //   quickswapFactoryAddr,
  //   UniswapV2ABI,
  //   deployer
  // )
  await (await uniswapFactory.createPair(artix, dai)).wait()
  const lpAddress = await uniswapFactory.getPair(artix.address, dai.address)
  // console.log('LP created: ' + lpAddress.address)

  // // Deploy bonding calc
  // const BondingCalculator = await ethers.getContractFactory('ArtixBondingCalculator')
  // const bondingCalculator = await BondingCalculator.deploy(artix.address)
  // console.log('Artix LP Bonding Calculator created: ' + bondingCalculator.address)

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
  // const StakingDistributor = await ethers.getContractFactory('ArtixStakingDistributor')
  // const stakingDistributor = await StakingDistributor.deploy(
  //   treasury.address,
  //   artix.address,
  //   epochLengthInSeconds,
  //   firstEpochTime
  // )
  // console.log('Staking Distribution: ' + stakingDistributor.address)

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
  // console.log('Staking: ' + staking.address)

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
  // console.log('DAI Bond: ' + daiBond.address)

  // //DAI-ARTIX Bond
  // const DaiArtixBond = await ethers.getContractFactory('ArtixBondDepository')
  // const daiArtixBond = await DaiArtixBond.deploy(
  //   artix.address,
  //   lpAddress,
  //   treasury.address,
  //   daoAddr,
  //   bondingCalculator.address
  // )
  // console.log('DAI-ARTIX Bond: ' + daiArtixBond.address)

  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = await IDO.deploy(
  //   artix.address,
  //   dai.address,
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
  // console.log("Queue and toggle DAI Reserve depositor successfully!")

  // // queue and toggle DAI-ARTIX liquidity depositor
  // await (await treasury.queue('4', daiArtixBond.address)).wait()
  // await treasury.toggle('4', daiArtixBond.address, zeroAddress)

  // await (await treasury.queue('4', deployer.address)).wait()
  // await treasury.toggle('4', deployer.address, zeroAddress)
  // console.log("Queue and toggle DAI-ARTIX liquidity depositor successfully!")

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
  // console.log("Set Bond terms, Initialize bond terms successfully!")

  // // Set staking for bonds
  // await daiBond.setStaking(staking.address, stakingHelper.address)
  // await daiArtixBond.setStaking(staking.address, stakingHelper.address)
  // console.log("Set staking for bonds successfully!")

  // // Initialize sARTIX and set the index
  // await sARTIX.initialize(staking.address)
  // await sARTIX.setIndex(initialIndex)
  // console.log("Initialize sARTIX and set the index successfully!")

  // // set distributor contract and warmup contract
  // await staking.setContract('0', stakingDistributor.address)
  // await staking.setContract('1', stakingWarmup.address)
  // await staking.setWarmup(warmupPeriod)
  // console.log("Set distributor contract and warmup contract successfully!")

  // // Set treasury for ARTIX token
  // await artix.setVault(treasury.address)
  // console.log("Set treasury for ARTIX token successfully!")

  // // Add staking contract as distributor recipient
  // await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  // console.log("Add staking contract as distributor recipient successfully!")

  // // queue and toggle reward manager
  // await (await treasury.queue('8', stakingDistributor.address)).wait(1)
  // await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  // console.log("Queue and toggle reward manager successfully!")

  // const Treasury = await ethers.getContractFactory('ArtixTreasury')
  // const treasury = Treasury.attach('0x12239Ec193A208343F7FEa8410b7a10cb7DFf9A6')

  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = await IDO.deploy(
  //   '0xcf2cf9Aee9A2b93a7AF9F2444843AFfDd8C435eb',
  //   '0x19907af68A173080c3e05bb53932B0ED541f6d20',
  //   '0x12239Ec193A208343F7FEa8410b7a10cb7DFf9A6',
  //   '0x72054987656EA1a801656AD0b9c52FB47aF76419',
  //   '0x3073478d69c4b40ec0BD4BA533536134B633aC71'
  // )
  // console.log('IDO: ' + ido.address)
  // await (
  //   await ido.whiteListBuyers([
  //     deployer.getAddress(),
  //     '0x61329D875252c1dD95a3eB339926AaF0A511Cc74',
  //   ])
  // ).wait()
  // await ido.initialize(
  //   BigNumber.from(200000).mul(BigNumber.from(10).pow(9)),
  //   BigNumber.from(5).mul(BigNumber.from(10).pow(18)),
  //   48 * 60 * 60, // 48 hours
  //   Math.round(Date.now() / 1000 - 30)
  // )

  // queue and toggle ido as reserve depositor
  // await (await treasury.queue('0', ido.address)).wait(1)
  // await treasury.toggle('0', ido.address, zeroAddress)

  // await (await treasury.queue('4', ido.address)).wait(1)
  // await treasury.toggle('4', ido.address, zeroAddress)

  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = IDO.attach('0xC4d9801372e6800D5dBb03eC907CbdDE437bE627')
  // await (await ido.disableWhiteList()).wait()
  // const wallets = []
  // for (let i = 0; i < 1000; i++) {
  //   const wallet = ethers.Wallet.createRandom().connect(deployer.provider)
  //   wallets.push(wallet)
  // }

  // console.log('whitelisting')
  // await (await ido.whiteListBuyers(wallets.map((w) => w.address))).wait()
    const treasury = "0x262b04fef2D9699C84F3286c3bAAA83195ac297b";
    const daiBond  = "0x26303b562b930f4cf75002A0043efe44308483aa";
    const router_temp  = "0xc080d7E40E099704703b2Fd72E1e5958f815C34B";
    const staking  = "0x365eDba77e6FDA7264A29a44203D6008df38Fa9d";
    const helper  = "0xf94c798FE1E6471331AAc9E106b620fef2EdB0A1";

    const Treasury = await ethers.getContractFactory('ArtixTreasury')
    const treasury_temp = Treasury.attach(treasury);

    
    
  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // Approve the treasury to spend DAI
  await Promise.all([
    (await dai_addr.approve(treasury, largeApproval)).wait(),
    (await dai_addr.approve(daiBond, largeApproval)).wait(),
    (await dai_addr.approve(router_temp, largeApproval)).wait(),
    (await artix.approve(staking, largeApproval)).wait(),
    (await artix.approve(helper, largeApproval)).wait(),
    (await artix.approve(router_temp, largeApproval)).wait(),
    (await lp.approve(treasury, largeApproval)).wait(),
  ])



  const totalIDODaiAmount = 100 * 10000
  const artixMinted = 200000
  const lpArtixAmount = 50000
  const initialArtixPriceInLP = 15
  const daiInTreasury = totalIDODaiAmount - initialArtixPriceInLP * lpArtixAmount
  const profit = daiInTreasury - artixMinted - lpArtixAmount
  console.log({ daiInTreasury, profit })

  await (
    await treasury_temp.deposit(
      ethers.utils.parseEther(String(daiInTreasury)),
      dai,
      BigNumber.from(profit).mul(1e9)
    )
  ).wait()
  console.log("Approve the treasury to spend DAI successfully!")

  // mint lp
  await (
    await router_temp.addLiquidity(
      dai,
      artix,
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      deployer.address,
      1000000000000
    )
  ).wait()
  console.log("Mint LP successfully!")

  // deposit lp with full profit
  const lpBalance = await lp.balanceOf(deployer.address)
  const valueOfLPToken = await treasury_temp.valueOfToken(lpAddress, lpBalance)
  await treasury.deposit(lpBalance, lpAddress, valueOfLPToken)
  console.log("Deposit Lp with full profit successfully!")

  // Stake ARTIX through helper
  // await stakingHelper.stake(
  //   BigNumber.from(artixMinted).mul(BigNumber.from(10).pow(9))
  // )

  // Bond 1,000 ARTIX in each of their bonds
  //   await daiBond.deposit("1000000000000000000000", "60000", deployer.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
