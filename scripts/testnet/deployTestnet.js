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
  // console.log('Deploying contracts with the account: ' + deployer.address)

  // Initial staking index
  const initialIndex = '1000000000'

  const { provider } = deployer
  // TODO: set this to launch date
  const firstEpochTime = (await provider.getBlock()).timestamp + 30 * 60
  // console.log('First epoch timestamp: ' + firstEpochTime)

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

  // Max bond payout, 1000 = 1% of CTXT total supply
  const maxBondPayout = '1000'

  // DAO fee for bond
  const bondFee = '10000'

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

  const daiAddr =
    chainId === 43113
      ? '0xb5EBD7033d1fE7D66A5A04014292B77FBBeD0741'
      : '0xb5EBD7033d1fE7D66A5A04014292B77FBBeD0741'

  // // Deploy DAI
  const DAI = await ethers.getContractFactory('DAI')
  const dai = await DAI.attach(daiAddr)
  // await dai.mint(deployer.address, initialMint)
  // console.log('DAI deployed: ' + dai.address)
  // const dai = await DAI.attach('0xA158C9C6E94D6dB8dA3F91Acf32de819085755Ac')

  // // Deploy CTXT
  const CTXT = await ethers.getContractFactory('ContextERC20')
  // const ctxt = await CTXT.deploy()
  // console.log('CTXT deployed: ' + ctxt.address)
  const ctxt = await CTXT.attach('0x476b459224339a623bCD20B2394b52A052dcD20E')

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
  // console.log('Initialize Circulating Supply has been done!')
  const contextCirculatingSupply = await ContextCirculatingSupply.attach(
    '0x0d458Ce5FC8adE2E45243f9cE962455E1C6492aB'
  )

  // const uniswapFactory = new ethers.Contract(
  //   contextFactoryAddress,
  //   UniswapFactoryAbi,
  //   deployer
  // )
  // console.log('Initialize uniswapFactory')

  // const createPairTransaction = await uniswapFactory.createPair(
  //   ctxt.address,
  //   dai.address
  // )
  // console.log('Create pair')
  // // console.log(await createPairTransaction.wait())
  // // console.log(await uniswapFactory.allPairs())
  // await (await uniswapFactory.createPair(ctxt.address, dai.address)).wait()
  // const lpAddress = await uniswapFactory.getPair(ctxt.address, dai.address)
  const lpAddress = '0x8207338bF0cd941e9C96F55105f9e42766f97E44'
  // console.log('LP created: ' + lpAddress)

  // // Deploy bonding calc
  const BondingCalculator = await ethers.getContractFactory(
    'ContextBondingCalculator'
  )
  // const bondingCalculator = await BondingCalculator.deploy(ctxt.address)
  // console.log('bondingCalculator deployed: ' + bondingCalculator.address)
  const bondingCalculator = await BondingCalculator.attach(
    '0xB8B416Dc5eF9abB5C6479caf7c57AAbA2EA1d911'
  )

  // // Deploy treasury
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
    '0xB72916Cc6FB340480031CDBa67Ab8D879a0eB641'
  )

  // const treasuryAddr = '0xB72916Cc6FB340480031CDBa67Ab8D879a0eB641'
  // const ctxt = '0x476b459224339a623bCD20B2394b52A052dcD20E'
  // Deploy staking distributor
  const StakingDistributor = await ethers.getContractFactory(
    'ContextStakingDistributor'
  )
  // const stakingDistributor = await StakingDistributor.deploy(
  //   treasury.address,
  //   ctxt,
  //   epochLengthInSeconds,
  //   firstEpochTime
  // )
  // console.log('stakingDistributor deployed: ' + stakingDistributor.address)
  const stakingDistributor = await StakingDistributor.attach(
    '0x24fa2509AD6AF2DB2c7c19531Bd728092e1bad49'
  )

  // Deploy sCTXT
  const StakedCTXT = await ethers.getContractFactory('StakedContextERC20')
  // const sCTXT = await StakedCTXT.deploy()
  // console.log('sCTXT deployed: ' + sCTXT.address)
  const sCTXT = await StakedCTXT.attach(
    '0xa4B02B211FACE6761b00c85c613674785EF8E7af'
  )

  // Deploy Staking
  const Staking = await ethers.getContractFactory('ContextStaking')
  // const staking = await Staking.deploy(
  //   ctxt,
  //   sCTXT.address,
  //   epochLengthInSeconds,
  //   firstEpochNumber,
  //   firstEpochTime
  // )
  // console.log('staking deployed: ' + staking.address)
  const staking = Staking.attach('0x31F7C4492587A3Be2E037978fAae2287Ad8B30E3')

  // Deploy staking warmpup
  const StakingWarmup = await ethers.getContractFactory('ContextStakingWarmup')
  // const stakingWarmup = await StakingWarmup.deploy(
  //   staking.address,
  //   sCTXT.address
  // )
  // console.log('stakingWarmup deployed: ' + stakingWarmup.address)
  const stakingWarmup = await StakingWarmup.attach(
    '0x654AC6923555Ac57a147F32f4184bbd6343d482c'
  )

  // Deploy staking helper
  const StakingHelper = await ethers.getContractFactory('ContextStakingHelper')
  // const stakingHelper = await StakingHelper.deploy(
  //   staking.address,
  //   ctxt
  // )
  // console.log('stakingHelper deployed: ' + stakingHelper.address)
  const stakingHelper = await StakingHelper.attach(
    '0x4cEA2FA50e74BCE99c4c2D90E15e322890dB15A0'
  )

  // Deploy DAI bond
  const DAIBond = await ethers.getContractFactory('ContextBondDepository')
  // const daiBond = await DAIBond.deploy(
  //   ctxt,
  //   dai.address,
  //   treasury.address,
  //   ledgerAddress,
  //   zeroAddress
  // )
  // console.log('daiBond deployed: ' + daiBond.address)
  const daiBond = await DAIBond.attach(
    '0x11739A71cB19ad2688995a9c50ee101BA913EB8C'
  )

  const DaiCtxtBond = await ethers.getContractFactory('ContextBondDepository')
  // const daiCtxtBond = await DaiCtxtBond.deploy(
  //   ctxt,
  //   lpAddress,
  //   treasury.address,
  //   ledgerAddress,
  //   bondingCalculator.address
  // )
  // console.log('daiCtxtBond deployed: ' + daiCtxtBond.address)
  const daiCtxtBond = await DaiCtxtBond.attach(
    '0x0eC22839df0EA7615f744B9A61216155596f1378'
  )

  // console.log(
  //   JSON.stringify(
  //     {
  //       sCTXT_ADDRESS: sCTXT.address,
  //       CTXT_ADDRESS: ctxt,
  //       DAI_ADDRESS: dai.address,
  //       TREASURY_ADDRESS: treasury.address,
  //       CTXT_BONDING_CALC_ADDRESS: bondingCalculator.address,
  //       STAKING_ADDRESS: staking.address,
  //       STAKING_HELPER_ADDRESS: stakingHelper.address,
  //       RESERVES: {
  //         DAI: dai.address,
  //         DAI_CTXT: lpAddress,
  //       },
  //       BONDS: {
  //         DAI: daiBond.address,
  //         DAI_CTXT: daiCtxtBond.address,
  //       },
  //       CTXT_CIRCULATING_SUPPLY: contextCirculatingSupply.address,
  //     },
  //     null,
  //     2
  //   )
  // )

  // // queue and toggle DAI reserve depositor
  // await (await treasury.queue('0', daiBond.address)).wait()
  // await treasury.toggle('0', daiBond.address, zeroAddress)
  // console.log(1)

  // // queue and toggle DAI-CTXT liquidity depositor
  // await (await treasury.queue('4', daiCtxtBond.address)).wait()
  // await treasury.toggle('4', daiCtxtBond.address, zeroAddress)
  // console.log(2)

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
  // console.log(3)
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
  // console.log(4)

  // // Set staking for bonds
  // await (
  //   await daiBond.setStaking(staking.address, stakingHelper.address)
  // ).wait()
  // await (
  //   await daiCtxtBond.setStaking(staking.address, stakingHelper.address)
  // ).wait()
  // console.log(5)

  // console.log(sCTXT)
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

  // // Add staking contract as distributor recipient
  // await stakingDistributor.addRecipient(staking.address, initialRewardRate)
  // console.log(9)

  // // queue and toggle reward manager
  // await (await treasury.queue('8', stakingDistributor.address)).wait(1)
  // await treasury.toggle('8', stakingDistributor.address, zeroAddress)
  // console.log(10)

  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // Approve the treasury to spend DAI
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
  // // // console.log('============ INJECT PARAMETER ===============')

  const ctxtMinted = 200000
  const lpCtxtAmount = 50000
  const initialCtxtPriceInLP = 15
  const daiInTreasury = initialCtxtPriceInLP * lpCtxtAmount
  const profit = daiInTreasury - ctxtMinted - lpCtxtAmount
  const dai_tot = 250000
  const profit_tot = 0
  // console.log({ daiInTreasury, profit })
  // await dai.mint(deployer.address, initialMint)
  // console.log('mint')

  await (
    await treasury.deposit(
      ethers.utils.parseEther(String(dai_tot)),
      dai.address,
      BigNumber.from(profit_tot).mul(1e9)
    )
  ).wait()
  // console.log(ethers.utils.parseEther(String(daiInTreasury)))
  // console.log(dai.address)
  // console.log(BigNumber.from(profit).mul(1e9))
  console.log(12)

  // // mint lp
  // await (
  //   await contextRouter.addLiquidity(
  //     dai.address,
  //     ctxt,
  //     ethers.utils.parseEther(String(lpCtxtAmount * initialCtxtPriceInLP)),
  //     ethers.utils.parseUnits(String(lpCtxtAmount), 9),
  //     ethers.utils.parseEther(String(lpCtxtAmount * initialCtxtPriceInLP)),
  //     ethers.utils.parseUnits(String(lpCtxtAmount), 9),
  //     deployer.address,
  //     1000000000000
  //   )
  // ).wait()
  // console.log('Mint LP')

  // // deposit lp with full profit
  // const lpBalance = await lp.balanceOf(deployer.address)
  // const valueOfLPToken = await treasury.valueOfToken(lpAddress, lpBalance)
  // await treasury.deposit(lpBalance, lpAddress, valueOfLPToken)
  // console.log('deposit lp with full profit')

  // Stake CTXT through helper
  // await stakingHelper.stake(
  //   BigNumber.from(ctxtMinted).mul(BigNumber.from(10).pow(9))
  // )
  // console.log('Stake')

  // Bond 1,000 CTXT in each of their bonds
  // await daiBond.deposit('1000000000000000000000', '60000', deployer.address)
  // console.log('Bond')
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
