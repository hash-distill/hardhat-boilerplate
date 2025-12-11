//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Voting {
    // 候选人结构体
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // 存储候选人列表
    Candidate[] public candidates;
    
    // 记录已投票的地址，防止重复投票
    mapping(address => bool) public voters;

    // 事件：当有人投票时触发，方便前端监听
    event VotedEvent(uint256 indexed _candidateId);

constructor() {
    // 定义不可篡改的候选人名单
    addCandidate("DeepSeek-V3.2");
    addCandidate("GPT-5.1");
    addCandidate("Gemini 3.0");
    addCandidate("Grok v4.1");
    addCandidate("Claude Sonnet 4.5");
}

    function addCandidate(string memory _name) private {
        candidates.push(Candidate(candidates.length, _name, 0));
    }

    function vote(uint256 _candidateId) public {
        // 1. 检查是否投过票
        require(!voters[msg.sender], "You have already voted.");
        // 2. 检查候选人ID是否有效
        require(_candidateId < candidates.length, "Invalid candidate.");

        // 3. 记录投票者状态
        voters[msg.sender] = true;
        // 4. 增加票数
        candidates[_candidateId].voteCount++;

        // 5. 触发事件
        emit VotedEvent(_candidateId);
    }

    // 获取候选人总数
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }
}