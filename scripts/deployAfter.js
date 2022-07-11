// @dev. This script will deploy this V1.1 of Artix. It will deploy the whole ecosystem.

const { ethers } = require('hardhat')
const { BigNumber } = ethers
// const { BigNumber, ContractFactory } = ethers
// const UniswapV2ABI = require('./IUniswapV2Factory.json').abi
const IUniswapV2Pair = require('./IUniswapV2Pair.json').abi
// const UniswapV2RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
// const { getQuickSwapAddresses } = require('./addresses')

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

  // const { router: quickswapRouterAddr, factory: quickswapFactoryAddr } =
  //   getQuickSwapAddresses(chainId)

  // const UniswapV2Router = ContractFactory.fromSolidity(
  //   UniswapV2RouterJson,
  //   deployer
  // )
  // const quickRouter = UniswapV2Router.attach(quickswapRouterAddr)

  const daiAddr =
    chainId === 43113
      ? '0xAc3f8193ecBe9E7F4DeEbf17639e89416FD0C804'
      : '0xAc3f8193ecBe9E7F4DeEbf17639e89416FD0C804'

  const wavaxAddr =
    chainId === 43113
      ? '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
      : '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'

  const artixAddr =
    chainId === 43113
      ? '0x3b7794a031ED89F276bE0C6862cb72eDCfd37774'
      : '0x3b7794a031ED89F276bE0C6862cb72eDCfd37774'

  const treasury =
    chainId === 43113
      ? '0xef36c778193dbd4b1c7eDD486Eeb3E2df26f70C2'
      : '0xef36c778193dbd4b1c7eDD486Eeb3E2df26f70C2'

  const daiBond =
    chainId === 43113
      ? '0x88d01F7db54d5c58c3251Fd95AC9863Ff10d916B'
      : '0x88d01F7db54d5c58c3251Fd95AC9863Ff10d916B'

  const uniswapRouter =
    chainId === 43113
      ? '0xA6ac62615E372C3d240A3b411F1cc1b350725B4f'
      : '0xA6ac62615E372C3d240A3b411F1cc1b350725B4f'

  const staking =
    chainId === 43113
      ? '0xDe289eE920c16C0715Ae2e7505C030F07106a592'
      : '0xDe289eE920c16C0715Ae2e7505C030F07106a592'

  const stakingHelper =
    chainId === 43113
      ? '0x559CAb71268B10331A52cd5Cf67c5077AE6205e8'
      : '0x559CAb71268B10331A52cd5Cf67c5077AE6205e8'
      
  const lpAddress =
    chainId === 43113
      ? '0xfB364537d7c95469c07C84093e973CEa0F3c6729'
      : '0xfB364537d7c95469c07C84093e973CEa0F3c6729'


    const DAI = await ethers.getContractFactory('DAI')
    const dai = DAI.attach(daiAddr)

    const ArtixERC20 = await ethers.getContractFactory('ArtixERC20')
    const artix = ArtixERC20.attach(artixAddr)

    const Treasury = await ethers.getContractFactory('ArtixTreasury')
    const treasury_contract = Treasury.attach(treasury)

    const UniswapV2Router02 = await ethers.getContractFactory('UniswapV2Router02');
    const router_contract = UniswapV2Router02.attach(uniswapRouter)

    const LPADDRESS = await ethers.getContractFactory('UniswapV2Router02');
    const lpAddress_contract = LPADDRESS.attach(uniswapRouter)

  const lp = new ethers.Contract(lpAddress, IUniswapV2Pair, deployer)
  // Approve the treasury to spend DAI
  // await Promise.all([
    // await dai.approve(treasury, largeApproval),
    // await dai.approve(daiBond, largeApproval),
    // await dai.approve(uniswapRouter, largeApproval),
    // await artix.approve(staking, largeApproval),
    // await artix.approve(stakingHelper, largeApproval),
    // await artix.approve(uniswapRouter, largeApproval),
    // console.log('await affter artix approve');
    // await lp.approve(treasury, largeApproval),
  // ])
  // console.log('Approve the treasury to spend DAI has been done!')

  const totalIDODaiAmount = 100 * 10000
  const artixMinted = 200000
  const lpArtixAmount = 50000
  const initialArtixPriceInLP = 15
  const daiInTreasury = totalIDODaiAmount - initialArtixPriceInLP * lpArtixAmount
  const profit = daiInTreasury - artixMinted - lpArtixAmount
  // console.log({ daiInTreasury, profit })

  // await (
    // await treasury_contract.deposit(
    //   ethers.utils.parseEther(String(daiInTreasury)),
    //   daiAddr,
    //   BigNumber.from(profit).mul(1e9)
    // )
  // ).wait()
  // console.log('Deposit DAI in Treasury has been done!')

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
    await router_contract.addLiquidity(
      dai.address,
      artix.address,
      lpdaimint,
      lpartixmint,
      lpdaimint,
      lpartixmint,
      deployer.address,
      9000000000000
    )
  ).wait()
  console.log('Mint LP has been done!')

  // deposit lp with full profit
  const lpBalance = await lp.balanceOf(deployer.address)
  const valueOfLPToken = await treasury_contract.valueOfToken(lpAddress, lpBalance)
  await treasury_contract.deposit(lpBalance, lpAddress, valueOfLPToken)
  console.log('Deposit lp with full profit has been done!')

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