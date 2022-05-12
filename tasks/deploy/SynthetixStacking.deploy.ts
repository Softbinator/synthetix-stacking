import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { SynthetixContractStaking, SynthetixContractStaking__factory } from "../../typechain";

task("deploy:SynthetixContractStaking").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const SynthetixContractStakingFactory: SynthetixContractStaking__factory = <SynthetixContractStaking__factory>(
    await ethers.getContractFactory("SynthetixContractStaking")
  );
  const SynthetixContractStaking: SynthetixContractStaking = <SynthetixContractStaking>(
    await SynthetixContractStakingFactory.deploy("0xeb8E5594AC476d025A6b841Be37bC30a8e94278e") // address of an already deployed token
  );
  await SynthetixContractStaking.deployed();
  console.log("SynthetixContractStaking deployed to: ", SynthetixContractStaking.address);
});
