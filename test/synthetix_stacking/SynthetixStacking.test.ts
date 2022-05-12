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

  it("Deploys with address 0 as token address", async () => {
    await expect(SynthetixStakingFactory.deploy(ethers.constants.AddressZero)).to.be.revertedWith(
      "InvalidAddressForToken()",
    );
  });

  it("Set token address", async () => {
    const STHX2: SynthetixToken = await SynthetixTokenFactory.deploy("SynthetixToken2", "STHX2");
    await expect(SynthetixStaking.setToken(STHX2.address))
      .to.emit(SynthetixStaking, "SetTokenAddress")
      .withArgs(STHX2.address);
  });

  it("Set token address to adress(0)", async () => {
    await expect(SynthetixStaking.setToken(ethers.constants.AddressZero)).to.be.revertedWith(
      "InvalidAddressForToken()",
    );
  });

  it("Address 0 earned calculation", async () => {
    await expect(SynthetixStaking.earned(ethers.constants.AddressZero)).to.be.revertedWith("InvalidAddress()");
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

    var reward: number = 5 * 10; // 5 from the delay

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });

  it("GetReward instantly after withdrawing", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);

    const blockNumStart = await ethers.provider.getBlockNumber();
    const blockStart = await ethers.provider.getBlock(blockNumStart);
    const timestampStart = blockStart.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);

    const blockNumWithdrawUser = await ethers.provider.getBlockNumber();
    const blockWithdrawUser = await ethers.provider.getBlock(blockNumWithdrawUser);
    const timestampWithdrawUser = blockWithdrawUser.timestamp;

    var reward: number = (timestampWithdrawUser - timestampStart) * 10;

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });

  it("GetReward after withdrawing with 5 sec delay", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);

    const blockNumStart = await ethers.provider.getBlockNumber();
    const blockStart = await ethers.provider.getBlock(blockNumStart);
    const timestampStart = blockStart.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);

    const blockNumWithdrawUser = await ethers.provider.getBlockNumber();
    const blockWithdrawUser = await ethers.provider.getBlock(blockNumWithdrawUser);
    const timestampWithdrawUser = blockWithdrawUser.timestamp;

    var reward: number = (timestampWithdrawUser - timestampStart) * 10;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
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

    const blockNumStart = await ethers.provider.getBlockNumber();
    const blockStart = await ethers.provider.getBlock(blockNumStart);
    const timestampStart = blockStart.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);

    const blockNumStakeBob = await ethers.provider.getBlockNumber();
    const blockStakeBob = await ethers.provider.getBlock(blockNumStakeBob);
    const timestampStakeBob = blockStakeBob.timestamp;

    var reward: number = (timestampStakeBob - timestampStart) * 10;

    reward += 1 * 4; // one more second, because getReward is minted in a separate block then withdraw

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });

  it("GetReward after another address stake with delay", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);

    const blockNumStart = await ethers.provider.getBlockNumber();
    const blockStart = await ethers.provider.getBlock(blockNumStart);
    const timestampStart = blockStart.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);

    const blockNumStakeBob = await ethers.provider.getBlockNumber();
    const blockStakeBob = await ethers.provider.getBlock(blockNumStakeBob);
    const timestampStakeBob = blockStakeBob.timestamp;

    var reward: number = (timestampStakeBob - timestampStart) * 10;

    await ethers.provider.send("evm_increaseTime", [5]);

    reward += 5 * 4; // 5 from the delay

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });

  it("GetReward after another address stake and withdraw", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);

    const blockNumStart = await ethers.provider.getBlockNumber();
    const blockStart = await ethers.provider.getBlock(blockNumStart);
    const timestampStart = blockStart.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);
    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);

    const blockNumStakeBob = await ethers.provider.getBlockNumber();
    const blockStakeBob = await ethers.provider.getBlock(blockNumStakeBob);
    const timestampStakeBob = blockStakeBob.timestamp;

    var reward: number = (timestampStakeBob - timestampStart) * 10;

    await ethers.provider.send("evm_increaseTime", [5]);

    await expect(SynthetixStaking.connect(bob).withdraw(150)).to.emit(SynthetixStaking, "Withdraw").withArgs(150);

    const blockNumWithdrawBob = await ethers.provider.getBlockNumber();
    const blockWithdrawBob = await ethers.provider.getBlock(blockNumWithdrawBob);
    const timestampWithdrawBob = blockWithdrawBob.timestamp;

    reward += (timestampWithdrawBob - timestampStakeBob) * 4;

    reward += 1 * 10; // one more second, because getReward is minted in a separate block then withdraw

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });

  it("GetReward after another address stake and withdraw and the user also withdraw", async () => {
    await STHX.approve(SynthetixStaking.address, "100000000000000");
    await STHX.connect(bob).approve(SynthetixStaking.address, "100000000000000");
    await STHX.mint(user.address, "1000");
    await STHX.mint(bob.address, "1000");

    await expect(SynthetixStaking.stake(100)).to.emit(SynthetixStaking, "Stake").withArgs(100);

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]);

    await expect(SynthetixStaking.connect(bob).stake(150)).to.emit(SynthetixStaking, "Stake").withArgs(150);

    const blockNumAfterStakeBob = await ethers.provider.getBlockNumber();
    const blockAfterStakeBob = await ethers.provider.getBlock(blockNumAfterStakeBob);
    const timestampAfterStakeBob = blockAfterStakeBob.timestamp;

    var reward: number = (timestampAfterStakeBob - timestampBefore) * 10;

    await ethers.provider.send("evm_increaseTime", [5]);

    await expect(SynthetixStaking.connect(bob).withdraw(150)).to.emit(SynthetixStaking, "Withdraw").withArgs(150);

    const blockNumAfterWithdrawBob = await ethers.provider.getBlockNumber();
    const blockAfterWithdrawBob = await ethers.provider.getBlock(blockNumAfterWithdrawBob);
    const timestampAfterWithdrawBob = blockAfterWithdrawBob.timestamp;

    reward += (timestampAfterWithdrawBob - timestampAfterStakeBob) * 4;

    await expect(SynthetixStaking.withdraw(100)).to.emit(SynthetixStaking, "Withdraw").withArgs(100);

    const blockNumAfterWithdrawUser = await ethers.provider.getBlockNumber();
    const blockAfterWithdrawUser = await ethers.provider.getBlock(blockNumAfterWithdrawUser);
    const timestampAfterWithUser = blockAfterWithdrawUser.timestamp;

    await ethers.provider.send("evm_increaseTime", [5]); // should have no effect

    reward += (timestampAfterWithUser - timestampAfterWithdrawBob) * 10;

    await expect(SynthetixStaking.getReward()).to.emit(SynthetixStaking, "GetReward").withArgs(reward);
  });
});
