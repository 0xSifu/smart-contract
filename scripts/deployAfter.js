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
  // const firstEpochTime = (await provider.getBlock()).timestamp - 100
  const firstEpochTime = 1658580619 //July 23, 2022 7:50:19 PM GMT+07:00
  console.log('First epoch timestamp: ' + firstEpochTime)

  // What epoch will be first epoch
  const firstEpochNumber = '1'

  // How many seconds are in each epoch
  const epochLengthInSeconds = 86400 / 3
  // const epochLengthInSeconds = 60 * 10

  // Initial reward rate for epoch
  const initialRewardRate = '5000'

  // Ethereum 0 address, used when toggling changes in treasury
  const zeroAddress = '0x0000000000000000000000000000000000000000'

  // Large number for approval for USDC
  const largeApproval = '100000000000000000000000000000000'

  // Initial mint for USDC (10,000,000)
  const initialMint = '10000000000000000000000000'

  // USDC bond BCV
  const usdcBondBCV = '300'

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

  const openBlock = '9754000'

  const openBlock2 = '0'

  const chainId = (await provider.getNetwork()).chainId
  console.log("GET CHAIN ID : "+ chainId)

  const { router: quickswapRouterAddr, factory: quickswapFactoryAddr } =
    getQuickSwapAddresses(chainId)

  const UniswapV2Router = ContractFactory.fromSolidity(
    UniswapV2RouterJson,
    deployer
  )
  const quickRouter = UniswapV2Router.attach(quickswapRouterAddr)

//   const usdcAddr =
//     chainId === 43113
//       ? '0x7cE1771c80d88372259A7350b3e3666B06ce3F9d'
//       : '0x7cE1771c80d88372259A7350b3e3666B06ce3F9d'

  const usdcAddr =
    chainId === 43113
      ? '0xDeBb4C4e1360844a3C531c3f16698B87813D1efa'
      : '0xDeBb4C4e1360844a3C531c3f16698B87813D1efa'

  // Deploy USDC
//   const USDC = await ethers.getContractFactory('USDC')
//   const usdc = USDC.attach(usdcAddr)
//   await usdc.mint(deployer.address, initialMint)
//   console.log('USDC addr: ' + usdc.address)

  // Deploy USDC
  const USDC = await ethers.getContractFactory('USDC')
  const usdc = USDC.attach(usdcAddr)
//   await usdc.mint(deployer.address, initialMint)
//   console.log('USDC addr: ' + usdc.address)

  // Deploy ARTIX
  const ARTIX = await ethers.getContractFactory('ArtixERC20TokenRev1')
  const artix = await ARTIX.attach('0xd6553832b7f22b4a9c34fa541eDae5C4b60ABbd8')

  // Deploy Circulating Supply
  const ArtixCirculatingSupply = await ethers.getContractFactory('ArtixCirculatingSupply')
  const artixCirculatingSupply = await ArtixCirculatingSupply.attach('0x8341a15b27f9C0C7307014b8803c32e9DfdC1C5a')

  // Initialize UniswapFactory
  const uniswapFactory = new ethers.Contract(
    quickswapFactoryAddr,
    UniswapV2ABI,
    deployer
  )
 
  // Deploy LP
  // await (await uniswapFactory.createPair(artix.address, usdc.address)).wait()
  const lpAddress = await uniswapFactory.attach('0x0A81F75f938B3EC852DCe2de749F62E042E14Ae2')

  // Deploy bonding calc
  const BondingCalculator = await ethers.getContractFactory(
    'ArtixBondingCalculatorRev1'
  )
  const bondingCalculator = await BondingCalculator.attach('0xe207E13Cf63C25704a8855646f7E2409e42CA48a')
  // console.log('bondingCalculator :'+ bondingCalculator.address)

  // Deploy treasury
  const Treasury = await ethers.getContractFactory('ArtixTreasuryRev1')
  const treasury = await Treasury.attach('0x99cD2810c80cC32d0D27055B0bcAB9F9f3cEfed8')

  // Deploy staking distributor
  const StakingDistributor = await ethers.getContractFactory('ArtixDistributorRev1')
  const stakingDistributor = await StakingDistributor.attach('0x7eeb9f729c0741CD4E404D7E15c4Dfc803cc9154')

  // Deploy sARTIX
  const StakedARTIX = await ethers.getContractFactory('sArtixRev1')
  const sARTIX = await StakedARTIX.attach('0x0748D9f5d330C291613B67Fd8bcF46331EC4a796')
  // await sARTIX.rebase()

  // Deploy Staking
  const Staking = await ethers.getContractFactory('ArtixStakingRev1')
  const staking = await Staking.attach('0xA7FEAcadf686291CE9AE59a89B8062Cac0292Bca')
  // console.log('Rebase :'+ staking);
  

  // Deploy staking warmpup
  const StakingWarmup = await ethers.getContractFactory('ArtixStakingWarmup')
  const stakingWarmup = await StakingWarmup.attach('0xEF22edC244b640Db6B5E077013844Aab96AbBa2A')

  // Deploy staking helper
  const StakingHelper = await ethers.getContractFactory('ArtixStakingHelperRev1')
  const stakingHelper = await StakingHelper.attach('0x5cc653d7d1259f6ef62E5DaFC2420De1418A1005')

  // Deploy RedeemStaking helper
  const RedeemStakingHelper = await ethers.getContractFactory('ArtixRedeemHelperRev1')
  const redeemStakingHelper = await RedeemStakingHelper.attach('0x660420441A151e1D18431d450ac0Fa4Ef81116F0')

   // Deploy USDC bond
   const USDCBond = await ethers.getContractFactory('USDCArtixBondDepository')
   const usdcBond = await USDCBond.attach('0x5bBF00F438C60E9C0f2c50Fcf126176B0751Cfa8')

  // Deploy USDC-ARTIX BOND
  const UsdcArtixBond = await ethers.getContractFactory('USDCLPArtixBondDepository')
  const usdcArtixBond = await UsdcArtixBond.attach('0xa3bD65e35802962f288f663685972d410B2daaBa')

  // // Deploy IDO
  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = await IDO.attach('0x4B3584A9ec3fbECEcf4E240BFb0e86EFd01128b9')

  // console.log(
  //   JSON.stringify({
  //     sARTIX_ADDRESS: sARTIX.address,
  //     ARTIX_ADDRESS: artix.address,
  //     USDC_ADDRESS: usdc.address,
  //     TREASURY_ADDRESS: treasury.address,
  //     ARTIX_BONDING_CALC_ADDRESS: bondingCalculator.address,
  //     STAKING_ADDRESS: staking.address,
  //     STAKING_HELPER_ADDRESS: stakingHelper.address,
  //     REDEEM_STAKING_HELPER: redeemStakingHelper.address,
  //     RESERVES: {
  //       USDC: usdc.address,
  //       USDC_ARTIX: lpAddress.address,
  //     },
  //     BONDS: {
  //       USDC: usdcBond.address,
  //       USDC_ARTIX: usdcArtixBond.address,
  //     },
  //     ARTIX_CIRCULATING_SUPPLY: artixCirculatingSupply.address,
  //   })
  // )

  // // queue and toggle USDC reserve depositor
  // await (await treasury.queue('0', usdcBond.address)).wait()
  // await treasury.toggle('0', usdcBond.address, zeroAddress)

  // await (await treasury.queue('0', deployer.address)).wait()
  // await treasury.toggle('0', deployer.address, zeroAddress)
  // console.log('Queue and toggle USDC reserve depositor has been done!')


  // // queue and toggle USDC-ARTIX liquidity depositor
  // await (await treasury.queue('4', usdcArtixBond.address)).wait()
  // await treasury.toggle('4', usdcArtixBond.address, zeroAddress)

  // await (await treasury.queue('4', deployer.address)).wait()
  // await treasury.toggle('4', deployer.address, zeroAddress)
  // console.log('Queue and toggle USDC-ARTIX liquidity depositor has been done!')

  // // Set bond terms
  // await usdcBond.initializeBondTerms(
  //   usdcBondBCV,
  //   bondVestingLength,
  //   minBondPrice,
  //   maxBondPayout,
  //   bondFee,
  //   maxBondDebt,
  //   initialBondDebt
  // )
  // await usdcArtixBond.initializeBondTerms(
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
  // await usdcBond.setStaking(staking.address, true)
  // await usdcArtixBond.setStaking(staking.address, true)
  // console.log('Set staking for bonds has been done!')

  // // Set openblock staking bonds USDC-BOND
  // const openblockbond = '9754000'
  // const openblockbond2 = '19754000'
  // await usdcBond.setOpenBlock(openblockbond)
  // await usdcBond.setOpenBlock(openblockbond2)
  // await usdcBond.setOpenBlock(openblockbond)
  // console.log('Set openblock staking bonds USDC-BOND has been done!')

  // // Set openblock staking bonds LP ARTIX-USDC BONDS
  // await usdcArtixBond.setOpenBlock(openblockbond)
  // console.log('Set openblock staking bonds LP ARTIX-USDC BOND has been done!')

  // // Initialize sARTIX and set the index
  // await sARTIX.initialize(staking.address)
  // await sARTIX.setIndex(initialIndex)
  // console.log('Initialize sARTIX and set the index has been done!')


  // // set distributor contract and warmup contract
  // await staking.setContract('0', stakingDistributor.address)
  // await staking.setWarmup(warmupPeriod)
  // await staking.setOpenBlock(openBlock)
  // await staking.setOpenBlock(openBlock2)
  // await staking.setOpenBlock(openBlock)
  // await staking.rebase()
  // console.log('Set warmup period, openblock, rebase on Staking Contract has been done!')

  // // Set treasury for ARTIX token
  // await artix.setVault(treasury.address)
  // console.log('Set treasury for ARTIX token has been done!')

  // Add staking contract as distributor recipient
  // await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  // console.log('Add staking contract as distributor recipient has been done!')

  // // queue and toggle reward manager
  // await (await treasury.queue('8', stakingDistributor.address)).wait(1)
  // await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  // console.log('Queue and toggle reward manager has been done!')

  // Set redeem helper
  // await redeemStakingHelper.addBondContract(usdcBond.address)
  // await redeemStakingHelper.addBondContract(usdcArtixBond.address)
  // console.log('Set bond contract --> redeem helper has been done!')


  const lp = new ethers.Contract(lpAddress.address, IUniswapV2Pair, deployer)
  // // Approve the treasury to spend USDC
  // await Promise.all([
  //   (await usdc.approve(treasury.address, largeApproval)).wait(),
  //   (await usdc.approve(usdcBond.address, largeApproval)).wait(),
  //   (await usdc.approve(quickRouter.address, largeApproval)).wait(),
  //   (await artix.approve(staking.address, largeApproval)).wait(),
  //   (await artix.approve(stakingHelper.address, largeApproval)).wait(),
  //   (await artix.approve(quickRouter.address, largeApproval)).wait(),
  //   (await lp.approve(treasury.address, largeApproval)).wait(),
  // ])
  // console.log('Approve the treasury to spend USDC has been done!')
  const totalIDOUsdcAmount = 100 * 10000
  const artixMinted = 200000
  const lpArtixAmount = 50000
  const initialArtixPriceInLP = 15
  const usdcInTreasury =initialArtixPriceInLP * lpArtixAmount
  const profit = usdcInTreasury - artixMinted - lpArtixAmount
  // console.log({ usdcInTreasury, profit })

  // await (
  //   await treasury.deposit(
  //     ethers.utils.parseEther(String(usdcInTreasury)),
  //     usdc.address,
  //     BigNumber.from(profit).mul(1e9)
  //   )
  // ).wait()
  // console.log('Deposit USDC in Treasury has been done!')
  
  // // mint lp
  // await (
  //   await quickRouter.addLiquidity(
  //     usdc.address,
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
  const lpBalance = await lp.balanceOf(deployer.address)
  // const valueOfLPToken = await treasury.valueOfToken(lpAddress.address, lpBalance)
  // console.log('Value LP Token :'+valueOfLPToken)
  // console.log('LP Balance :'+lpBalance)
  // console.log('LP Address :'+lpAddress.address)
  await treasury.deposit(lpBalance, lpAddress.address, profit)
  console.log('Deposit lp with full profit has been done!')

  // Stake ARTIX through helper
  // await stakingHelper.stake(
  //   BigNumber.from(artixMinted).mul(BigNumber.from(10).pow(9))
  // )

  // Bond 1,000 ARTIX in each of their bonds
  //   await usdcBond.deposit("1000000000000000000000", "60000", deployer.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

