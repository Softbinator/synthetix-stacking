import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  SynthetixContractStaking,
  SynthetixContractStaking__factory,
  SynthetixToken,
  SynthetixToken__factory,
} from "../../typechain";

describe("Synthetix Staking Tests", function () {
  let SynthetixStaking: SynthetixContractStaking;
  let STHX: SynthetixToken;
  let SynthetixStakingFactory: SynthetixContractStaking__factory;
  let SynthetixTokenFactory: SynthetixToken__factory;

  let user: SignerWithAddress;
  let bob: SignerWithAddress;

  before(async function () {
    [user, bob] = await ethers.getSigners();
    SynthetixStakingFactory = (await ethers.getContractFactory(
      "SynthetixContractStaking",
      user,
    )) as SynthetixContractStaking__factory;
    SynthetixTokenFactory = (await ethers.getContractFactory("SynthetixToken", user)) as SynthetixToken__factory;
  });

  beforeEach(async () => {
    STHX = await SynthetixTokenFactory.deploy("SynthetixToken", "STHX");
    SynthetixStaking = await SynthetixStakingFactory.deploy(STHX.address);
  });

  it("Deploys correctly", async () => {
    expect(await SynthetixStaking.token()).to.be.equal(STHX.address);
  });

  it("Stake", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
  });

  it("Withdraw", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);
  });

  it("GetReward without withdrawing", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(50);
  });

  it("GetReward instantly after withdrawing", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(50);
  });

  it("GetReward after withdrawing with 5 sec delay", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(50);
  });

  it("GetReward without staking", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(0);
  });

  it("Withdraw without staking", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await expect(SynthetixStaking.withdraw(100)).to.be.revertedWith("InsufficientFunds");
  });

  it("GetReward after another address stake", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(54);
  });

  it("GetReward after another address stake with delay", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(70);
  });

  it("GetReward after another address stake and withdraw", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).withdraw(150)).to.emit(SynthetixStaking, "Withdraw").withArgs(150);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(80);
  });

  it("GetReward after another address stake and withdraw and the user also withdraw", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);
    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).withdraw(150)).to.emit(SynthetixStaking, "Withdraw").withArgs(150);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);
    await ethers.provider.send("evm_increaseTime", [5]); // should have no effect
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(80); //  5 * 10 + 10(ca mai trece o secunda) + 5 * 4
  });
});
