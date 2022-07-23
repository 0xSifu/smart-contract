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
  // firstEpochTime = (await deployer.provider.getBlock()).timestamp - 100
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
  const minBondPrice = '600'

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
  await usdc.mint(deployer.address, initialMint)
  console.log('USDC addr: ' + usdc.address)

  // Deploy ARTIX
  const ARTIX = await ethers.getContractFactory('ArtixERC20TokenRev1')
  const artix = await ARTIX.deploy()
  console.log('ARTIX deployed: ' + artix.address)
  // const artix = await ARTIX.attach('0x320B596A23fEb6Fe06fb8c56C1c902BB34055DA8')

  // Deploy Circulating Supply
  const ArtixCirculatingSupply = await ethers.getContractFactory(
    'ArtixCirculatingSupply'
  )
  const artixCirculatingSupply = await ArtixCirculatingSupply.deploy(
    deployer.address
  )
  console.log('ARTIX circulating Supply: ' + artixCirculatingSupply.address)
  // const artixCirculatingSupply = await ArtixCirculatingSupply.attach('0x3fAd6092b7f429042AA508d95306FFc3E4B49a73')

  // Initialize CirculatingSupply
  await artixCirculatingSupply.deployTransaction.wait()
  await artixCirculatingSupply.initialize(artix.address)
  console.log('Initialize Circulating Supply has been done!')

  // Initialize UniswapFactory
  const uniswapFactory = new ethers.Contract(
    quickswapFactoryAddr,
    UniswapV2ABI,
    deployer
  )
  console.log(deployer.address);
  console.log('Initialize UniswapV2Factory has been done!')
 
  // Deploy LP
  await (await uniswapFactory.createPair(artix.address, usdc.address)).wait()
  const lpAddress = await uniswapFactory.getPair(artix.address, usdc.address)
  console.log('get pair UniSwapV2LPToken: ' + lpAddress)

  // Deploy bonding calc
  const BondingCalculator = await ethers.getContractFactory(
    'ArtixBondingCalculatorRev1'
  )
  const bondingCalculator = await BondingCalculator.deploy(artix.address)
  console.log('Artix Bond Calculator :'+bondingCalculator.address);

  // Deploy treasury
  const Treasury = await ethers.getContractFactory('ArtixTreasuryRev1')
  const treasury = await Treasury.deploy(
    artix.address,
    usdc.address,
    // lpAddress,
    // bondingCalculator.address,
    0
  )
  console.log('treasury deployed: ' + treasury.address)

  // Deploy staking distributor
  const StakingDistributor = await ethers.getContractFactory(
    'ArtixDistributorRev1'
  )

  const stakingDistributor = await StakingDistributor.deploy(
    treasury.address,
    artix.address,
    epochLengthInSeconds,
    firstEpochTime
  )
  console.log('Staking Distributor: ' + stakingDistributor.address)
// ===================================================================================================//
  // Deploy sARTIX
  const StakedARTIX = await ethers.getContractFactory('sArtixRev1')
  const sARTIX = await StakedARTIX.deploy()
  console.log('sARTIX: ' + sARTIX.address)

  // Deploy Staking
  const Staking = await ethers.getContractFactory('ArtixStakingRev1')
  const staking = await Staking.deploy(
    artix.address,
    sARTIX.address,
    epochLengthInSeconds,
    firstEpochNumber,
    firstEpochTime
  )
  console.log('STAKING: ' + staking.address)

  // Deploy staking warmpup
  const StakingWarmup = await ethers.getContractFactory('ArtixStakingWarmup')
  const stakingWarmup = await StakingWarmup.deploy(
    staking.address,
    sARTIX.address
  )
  console.log('Staking Warmup: ' + stakingWarmup.address)

  // Deploy staking helper
  const StakingHelper = await ethers.getContractFactory('ArtixStakingHelperRev1')
  const stakingHelper = await StakingHelper.deploy(
    staking.address,
    artix.address
  )
  console.log('Staking Helper: ' + stakingHelper.address)

  // Deploy RedeemStaking helper
  const RedeemStakingHelper = await ethers.getContractFactory('ArtixRedeemHelperRev1')
  const redeemStakingHelper = await RedeemStakingHelper.deploy()
  console.log('Redeem Staking Helper: ' + redeemStakingHelper.address)

  // Deploy USDC bond
  const USDCBond = await ethers.getContractFactory('USDCArtixBondDepository')
  const usdcBond = await USDCBond.deploy(
    artix.address,
    usdc.address,
    treasury.address,
    daoAddr,
    zeroAddress
  )
  console.log('USDC BOND: ' + usdcBond.address)

  // Deploy USDC-ARTIX BOND
  const UsdcArtixBond = await ethers.getContractFactory('USDCLPArtixBondDepository')
  const usdcArtixBond = await UsdcArtixBond.deploy(
    artix.address,
    lpAddress,
    treasury.address,
    daoAddr,
    bondingCalculator.address
  )
  console.log('USDC-ARTIX BOND: ' + usdcArtixBond.address)

  // Deploy IDO
  // const IDO = await ethers.getContractFactory('ArtixIDO')
  // const ido = await IDO.deploy(
  //   artix.address,
  //   usdcAddr,
  //   treasury.address,
  //   staking.address,
  //   lpAddress
  // )
  // console.log('IDO: ' + ido.address)

  console.log(
    JSON.stringify({
      sARTIX_ADDRESS: sARTIX.address,
      ARTIX_ADDRESS: artix.address,
      USDC_ADDRESS: usdc.address,
      TREASURY_ADDRESS: treasury.address,
      ARTIX_BONDING_CALC_ADDRESS: bondingCalculator.address,
      STAKING_ADDRESS: staking.address,
      STAKING_HELPER_ADDRESS: stakingHelper.address,
      REDEEM_STAKING_HELPER: redeemStakingHelper.address,
      RESERVES: {
        USDC: usdc.address,
        USDC_ARTIX: lpAddress,
      },
      BONDS: {
        USDC: usdcBond.address,
        USDC_ARTIX: usdcArtixBond.address,
      },
      ARTIX_CIRCULATING_SUPPLY: artixCirculatingSupply.address,
    })
  )

  // queue and toggle USDC reserve depositor
  await (await treasury.queue('0', usdcBond.address)).wait()
  await treasury.toggle('0', usdcBond.address, zeroAddress)

  await (await treasury.queue('0', deployer.address)).wait()
  await treasury.toggle('0', deployer.address, zeroAddress)
  console.log('Queue and toggle USDC reserve depositor has been done!')


  // queue and toggle USDC-ARTIX liquidity depositor
  await (await treasury.queue('4', usdcArtixBond.address)).wait()
  await treasury.toggle('4', usdcArtixBond.address, zeroAddress)

  await (await treasury.queue('4', deployer.address)).wait()
  await treasury.toggle('4', deployer.address, zeroAddress)
  console.log('Queue and toggle USDC-ARTIX liquidity depositor has been done!')

  // Set bond terms
  await usdcBond.initializeBondTerms(
    usdcBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    initialBondDebt
  )
  await usdcArtixBond.initializeBondTerms(
    '100',
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    initialBondDebt
  )
  console.log('Set bond terms has been done!')

  // Set staking for bonds
  await usdcBond.setStaking(staking.address, true)
  await usdcArtixBond.setStaking(staking.address, true)
  console.log('Set staking for bonds has been done!')

  // Set openblock staking bonds USDC-BOND
  const openblockbond = '9754000'
  const openblockbond2 = '19754000'
  await usdcBond.setOpenBlock(openblockbond)
  await usdcBond.setOpenBlock(openblockbond2)
  await usdcBond.setOpenBlock(openblockbond)
  console.log('Set openblock staking bonds USDC-BOND has been done!')

  // Set openblock staking bonds LP ARTIX-USDC BONDS
  await usdcArtixBond.setOpenBlock(openblockbond)
  console.log('Set openblock staking bonds LP ARTIX-USDC BOND has been done!')

  // Initialize sARTIX and set the index
  await sARTIX.initialize(staking.address)
  await sARTIX.setIndex(initialIndex)
  console.log('Initialize sARTIX and set the index has been done!')


  // set distributor contract and warmup contract
  await staking.setContract('0', stakingDistributor.address)
  await staking.setWarmup(warmupPeriod)
  await staking.setOpenBlock(openBlock)
  await staking.setOpenBlock(openBlock2)
  await staking.setOpenBlock(openBlock)
  await staking.rebase()
  console.log('Set warmup period, openblock, rebase on Staking Contract has been done!')

  // Set treasury for ARTIX token
  await artix.setVault(treasury.address)
  console.log('Set treasury for ARTIX token has been done!')

  // Add staking contract as distributor recipient
  await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  console.log('Add staking contract as distributor recipient has been done!')

  // queue and toggle reward manager
  await (await treasury.queue('8', stakingDistributor.address)).wait(1)
  await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  console.log('Queue and toggle reward manager has been done!')

  // Set redeem helper
  await redeemStakingHelper.addBondContract(usdcBond.address)
  await redeemStakingHelper.addBondContract(usdcArtixBond.address)
  console.log('Set bond contract --> redeem helper has been done!')


  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // Approve the treasury to spend USDC
  await Promise.all([
    (await usdc.approve(treasury.address, largeApproval)).wait(),
    (await usdc.approve(usdcBond.address, largeApproval)).wait(),
    (await usdc.approve(quickRouter.address, largeApproval)).wait(),
    (await artix.approve(staking.address, largeApproval)).wait(),
    (await artix.approve(stakingHelper.address, largeApproval)).wait(),
    (await artix.approve(quickRouter.address, largeApproval)).wait(),
    (await lp.approve(treasury.address, largeApproval)).wait(),
  ])
  console.log('Approve the treasury to spend USDC has been done!')
  const totalIDOUsdcAmount = 100 * 10000
  const artixMinted = 200000
  const lpArtixAmount = 50000
  const initialArtixPriceInLP = 15
  const usdcInTreasury = initialArtixPriceInLP * lpArtixAmount
  const profit = usdcInTreasury - artixMinted - lpArtixAmount
  console.log({ usdcInTreasury, profit })

  await (
    await treasury.deposit(
      ethers.utils.parseEther(String(usdcInTreasury)),
      usdc.address,
      BigNumber.from(profit).mul(1e9)
    )
  ).wait()
  console.log('Deposit USDC in Treasury has been done!')
  
  // mint lp
  await (
    await quickRouter.addLiquidity(
      usdc.address,
      artix.address,
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      deployer.address,
      1000000000000
    )
  ).wait()
  console.log('Mint LP has been done!')

  // deposit lp with full profit
  const lpBalance = await lp.balanceOf(deployer.address)
  const valueOfLPToken = await treasury.valueOfToken(lpAddress, lpBalance)
  await treasury.deposit(lpBalance, lpAddress, valueOfLPToken)
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

