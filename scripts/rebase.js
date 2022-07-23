const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const stakingAddress = '0x6A7848e86baC5F917466a42556fd7C958B96304F';
  const Staking = await ethers.getContractFactory("ArtixStakingRev1");
  const staking = Staking.attach(stakingAddress)
  const provider = deployer.provider;
  const block = await provider.getBlock()
  console.log("Chain id: " + (await provider.getNetwork()).chainId);
  console.log("Current block time: " + block.timestamp);

  let [length, number, endTime, distribute] = await staking.epoch();
  console.log(
    "Before rebase: ",
    JSON.stringify({
      length: length.toString(),
      number: number.toString(),
      endTime: endTime.toString(),
      distribute: distribute.toString(),
    })
  );
  await (await staking.rebase()).wait();

  [length, number, endTime, distribute] = await staking.epoch();
  console.log(
    "After rebase: ",
    JSON.stringify({
      length: length.toString(),
      number: number.toString(),
      endTime: endTime.toString(),
      distribute: distribute.toString(),
    })
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
