// SPDX-License-Identifier: GPL-3.0

// 定義版本
pragma solidity >=0.7.0 < 0.9.0;

// Imports
// 假設Owner就是管理員
import "./Owner.sol";

// Contract主程式碼區塊
contract AsiaUniversityBank is Owner {
    // 需要去記錄每個人的AU幣餘額
    mapping(address=>uint) auBalance;

    // 需要紀錄黑名單
    mapping(address=>bool) blacklist;

    // 需要去記錄事件們
    // #1 Deposit event: 知道誰在什麼時候存了多少錢
    event DepositEvent(address who, uint depositAmount, uint timestamp);
    // #2 Withdraw event: 知道誰在什麼時候提了多少錢
    event WithdrawEvent(address who, uint withdrawAmount, uint timestamp);
    // #3 Transfer event: 知道誰在什麼時候轉了多少錢
    event TransferEvent(address who, uint transferAmount, uint timestamp);

    // 確認誰不是黑名單人員
    modifier nonBlacklisted {
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

    // 下週(12/17 Fri)實作內容
    // 定義Deposit function
    // 將會發送deposit事件
    // function deposit() virtual public;

    // 定義Withdraw function
    // 將會發送withdraw事件
    // function withdraw() virtual public;

    // 定義Transfer function
    // 將會發送transfer事件
    // function transfer(address to, uint amount) virtual public;
}