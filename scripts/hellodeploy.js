const { ethers } = require("hardhat");

async function main() {
  // 1. 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. 获取合约工厂
  const HelloWorld = await ethers.getContractFactory("HelloWorld");

  // 3. 部署合约
  const hello = await HelloWorld.deploy("Hello World!");

  // --- 关键修改点开始 (适配 v5) ---
  
  // 4. 等待部署完成 (v5 写法是 deployed(), 不是 waitForDeployment())
  await hello.deployed();

  // 5. 打印合约地址 (v5 直接读取 .address 属性, 不需要 getAddress() 方法)
  console.log("HelloWorld contract address:", hello.address);

  // --- 关键修改点结束 ---
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });