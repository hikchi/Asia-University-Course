// SPDX-License-Identifier: GPL-3.0

// 定義版本
pragma solidity >=0.7.0 <0.9.0;

// Imports
// 假設Owner就是管理員
import "./Owner.sol";

// Contract主程式碼區塊
contract AsiaUniversityBankSol is Owner {
    // 需要去記錄每個人的AU幣餘額
    mapping(address => uint256) auBalance;

    // 需要紀錄黑名單
    mapping(address => bool) blacklist;

    // 需要去記錄事件們
    // #1 Deposit event: 知道誰在什麼時候存了多少錢
    event DepositEvent(address who, uint256 depositAmount, uint256 timestamp);
    // #2 Withdraw event: 知道誰在什麼時候提了多少錢
    event WithdrawEvent(address who, uint256 withdrawAmount, uint256 timestamp);
    // #3 Transfer event: 知道誰在什麼時候轉了多少錢
    event TransferEvent(address who, uint256 transferAmount, uint256 timestamp);
    // #4 Mint event: 知道管理員在什麼時候鑄給誰多少錢
    event MintEvent(address toWhom, uint256 mintedAmount, uint256 timestamp);
    // #5 Burn event: 知道管理員在什麼時候燒掉誰多少錢
    event BurnEvent(address toWhom, uint256 burntAmount, uint256 timestamp);
    // #6 Blacklist event: 知道管理員在什麼時候異動黑名單
    event BlacklistEvent(address toWhom, bool blacklisted, uint256 timestamp);

    // 確認誰不是黑名單人員
    modifier nonBlacklisted() {
        // 需要拒絕函式
        // 一但是黑名單裡面的人，我就拒絕執行
        require(blacklist[msg.sender] == false, "you're blocklisted!");
        // 執行剩下的程式碼
        _;
    }

    // 合約建構
    // 合約第一次被部署的時候，我需要執行什麼
    constructor() {
        // 目前還沒有需求
    }

    function balanceOf(address addr) public view returns (uint256) {
        return auBalance[addr];
    }

    function setBalance() public {
        auBalance[msg.sender] = 1 ether;
    }

    // 下週(12/17 Fri)實作內容
    // 定義Deposit function
    // 將會發送deposit事件
    function deposit() public payable nonBlacklisted {
        address sender = msg.sender;
        uint depositAmount = msg.value;

        auBalance[sender] += depositAmount;
        emit DepositEvent(sender, depositAmount, block.timestamp);
        
    }

    // 定義Withdraw function
    // 將會發送withdraw事件
    function withdraw(uint256 withdrawAmount) public nonBlacklisted {
        auBalance[msg.sender] -= withdrawAmount;
        (bool sent, ) = msg.sender.call{value: withdrawAmount}("");
        require(sent, "Failed to send Ether");
        emit WithdrawEvent(msg.sender, withdrawAmount, block.timestamp);
    }

    // 定義Transfer function
    // 將會發送transfer事件
    function transfer(address to, uint256 amount) public nonBlacklisted {
        address sender = msg.sender;

        auBalance[sender] -= amount;
        auBalance[to] += amount;

        emit TransferEvent(sender, amount, block.timestamp);
    }

    function mint(address to, uint256 mintedAmount) public isOwner {
        auBalance[to] += mintedAmount;
        emit MintEvent(to, mintedAmount, block.timestamp);
    }

    function burn(address to, uint256 burntAmount) public isOwner {
        auBalance[to] -= burntAmount;
        emit BurnEvent(to, burntAmount, block.timestamp);
    }

    function blacklisted(address to, bool _blacklisted) public isOwner {
        blacklist[to] = _blacklisted;
        emit BlacklistEvent(to, _blacklisted, block.timestamp);
    }
}
