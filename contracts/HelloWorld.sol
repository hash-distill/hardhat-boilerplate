// SPDX-License-Identifier: MIT
// 指定 Solidity 编译器版本
pragma solidity ^0.8.0;

// 引入 Hardhat 的控制台工具，允许我们在链上调试时打印日志
import "hardhat/console.sol";

contract HelloWorld {
    // 定义一个公开的字符串变量用来存储问候语
    string public greeting;

    // 构造函数：合约部署时只运行一次
    constructor(string memory _greeting) {
        console.log("Deploying HelloWorld with greeting:", _greeting);
        greeting = _greeting;
    }

    // 一个修改问候语的函数
    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }
}