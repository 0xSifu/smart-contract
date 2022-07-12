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

  const routerAddr =
    chainId === 43113
      ? '0xA262Fded6d70595FDd52C5E5B3faECe4a286Bf5D'
      : '0xA262Fded6d70595FDd52C5E5B3faECe4a286Bf5D'

  const Router = await ethers.getContractFactory('UniswapV2Router02')
  const router = Router.attach(routerAddr)
  // Deploy DAI
  const DAI = await ethers.getContractFactory('DAI')
  const dai = DAI.attach(daiAddr)
//   await dai.mint(deployer.address, initialMint)
//   console.log('DAI addr: ' + dai.address)

  const stakingDistributor = '0xb10B34522F628DFd2F37E0142395bc779827cBc4'
  const stakingWarmup      = '0xC9Dd57AEfFe6951d378ed26500b706C94d3D251C'
  const stakingAddr        = '0xAc4c7e1ae5A5EfffF2785651075b8381c556F9B4'
  const artixAddr          = '0x447b377fFEC0dC2016b5c65Ee7326215259A9DFb'
  const treasury           = '0x918a227d683b76D35530473CAaAB6c1c033c9E85'
  const daiBond            = '0xDAb3d7EcE8bDb5572f3A029853A4fa5d720428F3'
  const stakingHelper      = '0xdaC539715e398Fc2eA5701373EBA9b292796519f'

  const Staking = await ethers.getContractFactory('ArtixStaking')
  const staking = Staking.attach(stakingAddr)

  const ARTIX = await ethers.getContractFactory('ArtixERC20')
  const artix = ARTIX.attach(artixAddr)

  const StakingDistributor = await ethers.getContractFactory('ArtixStakingDistributor')
  const stakingDistributorContract = StakingDistributor.attach(stakingDistributor)

  const Treasury = await ethers.getContractFactory('ArtixTreasury')
  const treasuryContract = Treasury.attach(treasury)

  const DAIBond = await ethers.getContractFactory('ArtixBondDepository')
  const daiBondContract = DAIBond.attach(daiBond)

//   // set distributor contract and warmup contract
//   await staking.setContract('0', stakingDistributor)
//   await staking.setContract('1', stakingWarmup)
//   await staking.setWarmup(warmupPeriod)
//   console.log('Set distributor contract and warmup contract has been done!')

//   // Set treasury for ARTIX token
//   await artix.setVault(treasury)
//   console.log('Set treasury for ARTIX token has been done!')

//   // Add staking contract as distributor recipient
//   await stakingDistributorContract.addRecipient(stakingAddr, initialRewardRate)
//   console.log('Add staking contract as distributor recipient has been done!')

//   // queue and toggle reward manager
//   await (await treasuryContract.queue('8', stakingDistributor)).wait(1)
//   await treasuryContract.toggle('8', stakingDistributor, zeroAddress)
//   console.log('Queue and toggle reward manager has been done!')

  const uniswapFactory = new ethers.Contract(
    quickswapFactoryAddr,
    UniswapV2ABI,
    deployer
  )
  const lpAddress = await uniswapFactory.getPair(artixAddr, daiAddr)

  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // Approve the treasury to spend DAI
  await Promise.all([
    (await dai.approve(treasury, largeApproval)).wait(),
    (await dai.approve(daiBond, largeApproval)).wait(),
    (await dai.approve(routerAddr, largeApproval)).wait(),
    (await artix.approve(stakingAddr, largeApproval)).wait(),
    (await artix.approve(stakingHelper, largeApproval)).wait(),
    (await artix.approve(routerAddr, largeApproval)).wait(),
    (await lp.approve(treasury, largeApproval)).wait(),
  ])
  console.log('Approve the treasury to spend DAI has been done!')
  const totalIDODaiAmount = 100 * 10000
  const artixMinted = 200000
  const lpArtixAmount = 50000
  const initialArtixPriceInLP = 15
  const daiInTreasury = totalIDODaiAmount - initialArtixPriceInLP * lpArtixAmount
  const profit = daiInTreasury - artixMinted - lpArtixAmount
  // console.log({ daiInTreasury, profit })

  await (
    await treasuryContract.deposit(
      ethers.utils.parseEther(String(daiInTreasury)),
      dai.address,
      BigNumber.from(profit).mul(1e9)
    )
  ).wait()
  console.log('Deposit DAI in Treasury has been done!')
  
  // mint lp
  // await (
  //   await router_contract.addLiquidity(
  //       daiAddr,
  //     artixAddr,
  //     ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
  //     ethers.utils.parseUnits(String(lpArtixAmount), 9),
  //     ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
  //     ethers.utils.parseUnits(String(lpArtixAmount), 9),
  //     deployer.address,
  //     9000000000000
  //   )
  // ).wait()
  // console.log('Mint LP has been done!')
  const lpdaimint = 1000000000000000000000000
  const lpartixmint = 200000000000000
  // mint lp
  await (
    await router.addLiquidity(
      daiAddr,
      artixAddr,
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      ethers.utils.parseEther(String(lpArtixAmount * initialArtixPriceInLP)),
      ethers.utils.parseUnits(String(lpArtixAmount), 9),
      deployer.address,
      9000000000000
    )
  ).wait()
  console.log('Mint LP has been done!')

  // deposit lp with full profit
  const lpBalance = await lp.balanceOf(deployer.address)
  const valueOfLPToken = await treasuryContract.valueOfToken(lpAddress, lpBalance)
  await treasuryContract.deposit(lpBalance, lpAddress, valueOfLPToken)
  console.log('Deposit lp with full profit has been done!')
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


  