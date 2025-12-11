const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  // 1. 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. 获取 Voting 合约工厂
  // 确保你的 contracts 文件夹里有 Voting.sol 文件
  const Voting = await ethers.getContractFactory("Voting");
  
  // 3. 部署合约
  const voting = await Voting.deploy();

  // 4. 等待部署完成 (Ethers v5 写法)
  await voting.deployed();

  console.log("Voting contract address:", voting.address);

  // 5. 保存文件给前端使用 (关键步骤)
  // 我们把原来的 saveFrontendFiles(token) 改成了 saveFrontendFiles(voting)
  saveFrontendFiles(voting);
}

function saveFrontendFiles(contract) {
  const fs = require("fs");
  // 这里的路径指向 frontend/src/contracts 文件夹
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // 保存合约地址到 contract-address.json
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Voting: contract.address }, undefined, 2)
  );

  // 保存合约的 ABI (接口) 到 Voting.json
  const VotingArtifact = artifacts.readArtifactSync("Voting");

  fs.writeFileSync(
    path.join(contractsDir, "Voting.json"),
    JSON.stringify(VotingArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });