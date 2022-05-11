import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { SynthetixContractStaking, SynthetixContractStaking__factory } from "../../typechain";

task("deploy:SynthetixContractStaking").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const SynthetixContractStakingFactory: SynthetixContractStaking__factory = <SynthetixContractStaking__factory>(
    await ethers.getContractFactory("SynthetixContractStaking")
  );
  const SynthetixContractStaking: SynthetixContractStaking = <SynthetixContractStaking>(
    await SynthetixContractStakingFactory.deploy("0xe2f33B6852338C5997fA6f66B4fBd8eBe29e4652")
  );
  await SynthetixContractStaking.deployed();
  console.log("SynthetixContractStaking deployed to: ", SynthetixContractStaking.address);
});
