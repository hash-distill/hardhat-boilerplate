require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

// 1. 引入 dotenv 来读取 .env 文件
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // 2. 确保这里的版本号跟你合约里的 pragma solidity ^0.8.0 匹配
  solidity: "0.8.24", 

  networks: {
    // 本地网络配置 (默认存在)
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // 3. 添加 Sepolia 网络配置
    sepolia: {
      // 读取 .env 中的 URL
      url: process.env.SEPOLIA_URL, 
      // 读取 .env 中的私钥
      accounts: [process.env.PRIVATE_KEY] 
    }
  }
};
