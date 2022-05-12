import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { SynthetixToken, SynthetixToken__factory } from "../../typechain";

describe("Synthetix Staking Tests", function () {
  let STHX: SynthetixToken;
  let SynthetixTokenFactory: SynthetixToken__factory;

  let user: SignerWithAddress;
  let bob: SignerWithAddress;

  before(async function () {
    [user, bob] = await ethers.getSigners();
    SynthetixTokenFactory = (await ethers.getContractFactory("SynthetixToken", user)) as SynthetixToken__factory;
  });

  beforeEach(async () => {
    STHX = await SynthetixTokenFactory.deploy("SynthetixToken", "STHX");
  });

  it("Deploys correctly", async () => {});

  it("Mint", async () => {
    await expect(STHX.mint(bob.address, 10))
      .to.emit(STHX, "Transfer")
      .withArgs(ethers.constants.AddressZero, bob.address, 10);
    expect(await STHX.balanceOf(bob.address)).that.be.equal(10);
  });

  it("Burn", async () => {
    await expect(STHX.mint(bob.address, 10))
      .to.emit(STHX, "Transfer")
      .withArgs(ethers.constants.AddressZero, bob.address, 10);
    expect(await STHX.balanceOf(bob.address)).that.be.equal(10);

    await expect(STHX.burn(bob.address, 10))
      .to.emit(STHX, "Transfer")
      .withArgs(bob.address, ethers.constants.AddressZero, 10);
    expect(await STHX.balanceOf(bob.address)).that.be.equal(0);
  });
});
