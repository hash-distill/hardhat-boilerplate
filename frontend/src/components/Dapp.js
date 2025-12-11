import React from "react";
// 引入 Ethers.js
import { ethers } from "ethers";

// 引入我们刚刚部署生成的合约文件
import VotingArtifact from "../contracts/Voting.json";
import contractAddress from "../contracts/contract-address.json";

// 引入模板自带的组件（保持界面美观）
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";

const HARDHAT_NETWORK_ID = '31337'; // 本地网络ID
const SEPOLIA_NETWORK_ID = '11155111'; // Sepolia网络ID

export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    // 初始化状态
    this.state = {
      selectedAddress: undefined, // 用户钱包地址
      votingContract: undefined,  // 合约实例
      candidates: [],             // 候选人列表
      networkError: undefined,
      txBeingSent: undefined,     // 是否正在发送交易
    };
  }

  render() {
    // 1. 如果没连钱包，显示连接按钮
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // 2. 如果正在投票（交易等待中），显示Loading
    if (this.state.txBeingSent) {
      return <Loading />;
    }

// --- 3.美化后的主界面 ---
    return (
      <div className="container-fluid p-5" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 text-center mb-5">
            {/* 1. 标题区域：增加一些 emoji 和渐变色文字效果 */}
            <h1 className="display-4 fw-bold mb-3" style={{ background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🤖 2025 AI 大模型争霸赛
            </h1>
            <p className="lead text-muted">基于以太坊 Sepolia 测试网的去中心化投票系统</p>
            
            {/* 2. 钱包状态栏：做成胶囊样式 */}
            <div className="d-inline-block bg-white shadow-sm rounded-pill px-4 py-2 mt-2 border">
              <span className="text-success me-2">●</span>
              <small className="text-secondary fw-bold">已连接钱包:</small>
              <span className="ms-2 text-dark font-monospace">
                {this.state.selectedAddress.substring(0, 6)}...{this.state.selectedAddress.substring(38)}
              </span>
            </div>
          </div>

          <div className="col-12 col-md-10">
            {/* 3. 候选人展示区：从 List 变为 Grid (网格) */}
            {this.state.candidates.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">正在从区块链读取候选人名单...</p>
              </div>
            ) : (
              <div className="row g-4">
                {this.state.candidates.map((candidate, index) => (
                  <div className="col-12 col-md-6 col-lg-4" key={index}>
                    <div className="card h-100 border-0 shadow-sm hover-effect" style={{ transition: "transform 0.2s" }}>
                      {/* 卡片头部装饰条 */}
                      <div className="card-header border-0" style={{ height: "10px", background: `hsl(${index * 60}, 70%, 60%)` }}></div>
                      
                      <div className="card-body text-center p-4">
                        {/* 候选人名字 */}
                        <h3 className="card-title fw-bold mb-3">{candidate.name}</h3>
                        
                        {/* 票数展示 (大数字) */}
                        <div className="my-4 p-3 rounded bg-light">
                          <div className="text-uppercase text-muted small fw-bold tracking-wide">当前票数</div>
                          <div className="display-4 fw-bold text-primary">
                            {candidate.voteCount.toString()}
                          </div>
                        </div>

                        {/* 投票按钮 */}
                        <button 
                          className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                          style={{ borderRadius: "50px" }}
                          onClick={() => this._vote(index)}
                        >
                          🗳️ 投给 TA
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 简单的页脚 */}
        <div className="text-center text-muted mt-5 pt-5 small">
          Group Project © 2025 | Powered by Ethereum & Hardhat
        </div>
      </div>
    );
  }

  // --- 核心逻辑区 ---

  // 连接钱包
  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this._checkNetwork();
    this._initialize(selectedAddress);
    
    // 监听账户变化
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) { return this._resetState(); }
      this._initialize(newAddress);
    });
  }

  // 初始化：连接合约
  async _initialize(userAddress) {
    this.setState({ selectedAddress: userAddress });

    // 使用 Web3Provider 连接
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 实例化合约
    const votingContract = new ethers.Contract(
      contractAddress.Voting, // 合约地址
      VotingArtifact.abi,     // 合约接口
      provider.getSigner(0)   // 签名者（当前用户）
    );

    this.setState({ votingContract }, () => {
      this._updateCandidates(); // 连接成功后，立即拉取数据
    });
  }

  // 从区块链读取候选人数据
  async _updateCandidates() {
    if (!this.state.votingContract) return;

    try {
      const count = await this.state.votingContract.getCandidatesCount();
      let tempCandidates = [];
      
      // 循环读取每一个候选人信息
      for (let i = 0; i < count; i++) {
        const candidate = await this.state.votingContract.candidates(i);
        tempCandidates.push(candidate);
      }

      this.setState({ candidates: tempCandidates });
    } catch (error) {
      console.error("读取数据失败:", error);
    }
  }

  // 发起投票 (写操作)
  async _vote(candidateId) {
    try {
      this.setState({ txBeingSent: true });

      // 发送交易
      const tx = await this.state.votingContract.vote(candidateId);
      
      console.log("交易发送成功，Hash:", tx.hash);

      // 等待交易被矿工打包确认
      await tx.wait(); 

      // 交易完成后，刷新数据
      await this._updateCandidates();
    } catch (error) {
      console.error(error);
      window.alert("投票失败！原因可能是：\n1. 你已经投过票了\n2. 拒绝了交易\n3. 余额不足");
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  // 检查网络是否正确
  async _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID && window.ethereum.networkVersion !== SEPOLIA_NETWORK_ID) {
      this.setState({ networkError: '请切换到 Sepolia 测试网 或 Localhost' });
    }
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _resetState() {
    this.setState(this.getInitialState());
  }
}