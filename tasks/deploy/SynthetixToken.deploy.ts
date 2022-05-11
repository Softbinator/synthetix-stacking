import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { SynthetixToken, SynthetixToken__factory } from "../../typechain";

task("deploy:SynthetixToken").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const STHXFactory: SynthetixToken__factory = <SynthetixToken__factory>(
    await ethers.getContractFactory("SynthetixToken")
  );
  const STHX: SynthetixToken = <SynthetixToken>await STHXFactory.deploy("SynthetixToken", "STHX");
  await STHX.deployed();
  console.log("STHX deployed to: ", STHX.address);
});
