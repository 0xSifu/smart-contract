// @dev. This script will deploy this V1.1 of Context. It will deploy the whole ecosystem.

const { ethers } = require('hardhat')
const { BigNumber, ContractFactory } = ethers
const UniswapFactoryAbi = require('./IUniswapV2Factory.json').abi
const IUniswapV2Pair = require('./IUniswapV2Pair.json').abi
const UniswapV2RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const { getContextExchangeAddresses } = require('./addresses')

async function main() {
  const [deployer] = await ethers.getSigners()
  const ledgerAddress = '0x744826f60cd9cAa30620F3471A9F70589b13783C'
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
  const epochLengthInSeconds = 86400 / 3

  // Initial reward rate for epoch
  const initialRewardRate = '5000'

  // Ethereum 0 address, used when toggling changes in treasury
  const zeroAddress = '0x0000000000000000000000000000000000000000'

  // Large number for approval for DAI
  const largeApproval = '100000000000000000000000000000000'

  // DAI bond BCV
  const daiBondBCV = '300'

  // Bond vesting length in seconds.
  const bondVestingLength = 5 * 24 * 60 * 60 // 5 days

  // Min bond price
  const minBondPrice = '1000'

  // Max bond payout, 1000 = 1% of CTXT total supply
  const maxBondPayout = '1000'

  // DAO fee for bond
  const bondFee = '10000' // 10%

  // Max debt bond can take on
  const maxBondDebt = '8000000000000000'

  // Initial Bond debt
  const initialBondDebt = '0'

  const warmupPeriod = '3'

  const chainId = (await provider.getNetwork()).chainId

  const { router: contextRouterAddress, factory: contextFactoryAddress } =
    getContextExchangeAddresses(chainId)

  const UniswapV2Router = ContractFactory.fromSolidity(
    UniswapV2RouterJson,
    deployer
  )
  const contextRouter = UniswapV2Router.attach(contextRouterAddress)

  const DAI = await ethers.getContractFactory('DAI')
  const dai = await DAI.attach('0xd586e7f844cea2f87f50152665bcbc2c279d8d70')

  // Deploy CTXT
  const CTXT = await ethers.getContractFactory('ContextERC20')
  // const ctxt = await CTXT.deploy()
  // console.log('CTXT deployed: ' + ctxt.address)
  const ctxt = await CTXT.attach('0x03bDBC5E96F07A9bA53d088C4Ca51B63cc973a28')

  // await ctxt.setVault(deployer.address)
  // // https://contextfinance.medium.com/introducing-context-aab6cd1d121b
  // await ctxt.mint(
  //   ledgerAddress,
  //   ethers.utils.parseUnits('1000000', await ctxt.decimals())
  // )

  const ContextCirculatingSupply = await ethers.getContractFactory(
    'ContextCirculatingSupply'
  )
  // const contextCirculatingSupply = await ContextCirculatingSupply.deploy(
  //   deployer.address
  // )
  // console.log(
  //   'ContextCirculatingSupply deployed: ' + contextCirculatingSupply.address
  // )
  // await contextCirculatingSupply.deployTransaction.wait()
  // await contextCirculatingSupply.initialize(ctxt.address)
  const contextCirculatingSupply = await ContextCirculatingSupply.attach(
    '0x8f926d03a62D8b379579936b769887b44E24347e'
  )

  const uniswapFactory = new ethers.Contract(
    contextFactoryAddress,
    UniswapFactoryAbi,
    deployer
  )

  // const createPairTransaction = await uniswapFactory.createPair(
  //   ctxt.address,
  //   dai.address
  // )
  // const lpAddress = await uniswapFactory.getPair(ctxt.address, dai.address)
  // console.log('LP created: ' + lpAddress)
  const lpAddress = '0x49Bd8BBf9e6daf44Da9F28a01734B88f3E88B03f'

  // Deploy bonding calc
  const BondingCalculator = await ethers.getContractFactory(
    'ContextBondingCalculator'
  )
  // const bondingCalculator = await BondingCalculator.deploy(ctxt.address)
  // console.log('bondingCalculator deployed: ' + bondingCalculator.address)
  const bondingCalculator = await BondingCalculator.attach(
    '0x4d03fF90E322CB85299D63378D08287D8bb968B1'
  )

  // Deploy treasury
  const Treasury = await ethers.getContractFactory('ContextTreasury')
  // const treasury = await Treasury.deploy(
  //   ctxt.address,
  //   dai.address,
  //   lpAddress,
  //   bondingCalculator.address,
  //   0
  // )
  // console.log('treasury deployed: ' + treasury.address)
  const treasury = await Treasury.attach(
    '0x735BCf7E4502D155841bDAb96B31cc276DF3d0A4'
  )

  // Deploy staking distributor
  const StakingDistributor = await ethers.getContractFactory(
    'ContextStakingDistributor'
  )
  // const stakingDistributor = await StakingDistributor.deploy(
  //   treasury.address,
  //   ctxt.address,
  //   epochLengthInSeconds,
  //   firstEpochTime
  // )
  // console.log('stakingDistributor deployed: ' + stakingDistributor.address)
  const stakingDistributor = await StakingDistributor.attach(
    '0x364804C3DAc05612a0eFeC922C4fdeBB01b28773'
  )

  // Deploy sCTXT
  const StakedCTXT = await ethers.getContractFactory('StakedContextERC20')
  // const sCTXT = await StakedCTXT.deploy()
  // console.log('sCTXT deployed: ' + sCTXT.address)
  const sCTXT = await StakedCTXT.attach(
    '0x097673E62b24f08Dad62ACf3D691790Eb3FCC317'
  )

  // Deploy Staking
  const Staking = await ethers.getContractFactory('ContextStaking')
  // const staking = await Staking.deploy(
  //   ctxt.address,
  //   sCTXT.address,
  //   epochLengthInSeconds,
  //   firstEpochNumber,
  //   firstEpochTime
  // )
  // console.log('staking deployed: ' + staking.address)
  const staking = Staking.attach('0x9c69f325969bd7468f0f01f1ea9aE009a850b547')

  // Deploy staking warmpup
  const StakingWarmup = await ethers.getContractFactory('ContextStakingWarmup')
  // const stakingWarmup = await StakingWarmup.deploy(
  //   staking.address,
  //   sCTXT.address
  // )
  // console.log('stakingWarmup deployed: ' + stakingWarmup.address)
  const stakingWarmup = await StakingWarmup.attach(
    '0x14dc0BB67c5770A870652822b06f35099E595163'
  )

  // Deploy staking helper
  const StakingHelper = await ethers.getContractFactory('ContextStakingHelper')
  // const stakingHelper = await StakingHelper.deploy(
  //   staking.address,
  //   ctxt.address
  // )
  // console.log('stakingHelper deployed: ' + stakingHelper.address)
  const stakingHelper = await StakingHelper.attach(
    '0x3DDa3F515B5b2AbC313c2b196Db3CFF9545080ec'
  )

  // Deploy DAI bond
  const DAIBond = await ethers.getContractFactory('ContextBondDepository')
  // const daiBond = await DAIBond.deploy(
  //   ctxt.address,
  //   dai.address,
  //   treasury.address,
  //   ledgerAddress,
  //   zeroAddress
  // )
  // console.log('daiBond deployed: ' + daiBond.address)
  const daiBond = await DAIBond.attach(
    '0x3ABE497e51279f348b6AaB617f09987EE90fc25d'
  )

  const DaiCtxtBond = await ethers.getContractFactory('ContextBondDepository')
  // const daiCtxtBond = await DaiCtxtBond.deploy(
  //   ctxt.address,
  //   lpAddress,
  //   treasury.address,
  //   ledgerAddress,
  //   bondingCalculator.address
  // )
  // console.log('daiCtxtBond deployed: ' + daiCtxtBond.address)
  const daiCtxtBond = await DaiCtxtBond.attach(
    '0x81d78ed72f24118FCF2477E37AC07c89024173aa'
  )

  console.log(
    JSON.stringify(
      {
        sCTXT_ADDRESS: sCTXT.address,
        CTXT_ADDRESS: ctxt.address,
        DAI_ADDRESS: dai.address,
        TREASURY_ADDRESS: treasury.address,
        CTXT_BONDING_CALC_ADDRESS: bondingCalculator.address,
        STAKING_ADDRESS: staking.address,
        STAKING_HELPER_ADDRESS: stakingHelper.address,
        RESERVES: {
          DAI: dai.address,
          DAI_CTXT: lpAddress,
        },
        BONDS: {
          DAI: daiBond.address,
          DAI_CTXT: daiCtxtBond.address,
        },
        CTXT_CIRCULATING_SUPPLY: contextCirculatingSupply.address,
      },
      null,
      2
    )
  )

  // // queue and toggle DAI reserve depositor
  // await treasury.queue('0', daiBond.address)
  // await treasury.toggle('0', daiBond.address, zeroAddress)

  // // queue and toggle DAI-CTXT liquidity depositor
  // await treasury.queue('4', daiCtxtBond.address)
  // await treasury.toggle('4', daiCtxtBond.address, zeroAddress)

  // // Set bond terms
  // await daiBond.initializeBondTerms(
  //   daiBondBCV,
  //   bondVestingLength,
  //   minBondPrice,
  //   maxBondPayout,
  //   bondFee,
  //   maxBondDebt,
  //   initialBondDebt,
  //   { gasLimit: 1000000 }
  // )
  // await daiCtxtBond.initializeBondTerms(
  //   '100',
  //   bondVestingLength,
  //   minBondPrice,
  //   maxBondPayout,
  //   bondFee,
  //   maxBondDebt,
  //   initialBondDebt,
  //   { gasLimit: 1000000 }
  // )

  // // Set staking for bonds
  // await daiBond.setStaking(stakingHelper.address, true)
  // await daiCtxtBond.setStaking(stakingHelper.address, true)

  // Initialize sCTXT and set the index
  // await sCTXT.initialize(staking.address)
  // await sCTXT.setIndex(initialIndex)
  // console.log(6)

  // // set distributor contract and warmup contract
  // await staking.setContract('0', stakingDistributor.address)
  // await staking.setContract('1', stakingWarmup.address)
  // await staking.setWarmup(warmupPeriod)
  // console.log(7)

  // // Set treasury for CTXT token
  // await ctxt.setVault(treasury.address)
  // console.log(8)

  // // // Add staking contract as distributor recipient
  // await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  // console.log(9)

  // // // queue and toggle reward manager
  // await treasury.queue('8', stakingDistributor.address)
  // await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  // console.log(10)

  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // // Approve the treasury to spend DAI
  // for (const approval of [
  //   () => dai.approve(treasury.address, largeApproval),
  //   () => dai.approve(daiBond.address, largeApproval),
  //   () => dai.approve(contextRouter.address, largeApproval),
  //   () => ctxt.approve(staking.address, largeApproval),
  //   () => ctxt.approve(stakingHelper.address, largeApproval),
  //   () => ctxt.approve(contextRouter.address, largeApproval),
  //   () => lp.approve(treasury.address, largeApproval),
  // ]) {
  //   await (await approval()).wait()
  // }
  // console.log(11)

  console.log(
    (
      await treasury.valueOfToken(dai.address, ethers.utils.parseEther('1'))
    ).toString()
  )

  console.log(await treasury.isReserveDepositor(deployer.address))
  await (
    await treasury.deposit(
      ethers.utils.parseEther('1'),
      dai.address,
      ethers.utils.parseEther('0.5')
    )
  ).wait()

  return

  // mint lp
  await (
    await contextRouter.addLiquidity(
      dai.address,
      ctxt.address,
      ethers.utils.parseEther(String(lpCtxtAmount * initialCtxtPriceInLP)),
      ethers.utils.parseUnits(String(lpCtxtAmount), 9),
      ethers.utils.parseEther(String(lpCtxtAmount * initialCtxtPriceInLP)),
      ethers.utils.parseUnits(String(lpCtxtAmount), 9),
      deployer.address,
      1000000000000
    )
  ).wait()

  // deposit lp with full profit
  const lpBalance = await lp.balanceOf(deployer.address)
  const valueOfLPToken = await treasury.valueOfToken(lpAddress, lpBalance)
  await treasury.deposit(lpBalance, lpAddress, valueOfLPToken)

  // Stake CTXT through helper
  await stakingHelper.stake(
    BigNumber.from(ctxtMinted).mul(BigNumber.from(10).pow(9))
  )

  // Bond 1,000 CTXT in each of their bonds
  await daiBond.deposit('1000000000000000000000', '60000', deployer.address)
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
