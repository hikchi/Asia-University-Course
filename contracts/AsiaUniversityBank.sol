// SPDX-License-Identifier: GPL-3.0

// 定義版本
pragma solidity >=0.7.0 <0.9.0;

// Imports
// 假設Owner就是管理員
import "./Owner.sol";

// Contract主程式碼區塊
// 定義 1AU 單位是 10**18 -> 1000000000000000000
// 0.1AU => 10**17
contract AsiaUniversityBank is Owner {
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

    // 確認誰不是黑名單人員
    modifier nonBlacklisted() {
        // 需要拒絕函式
        // 一但是黑名單裡面的人，我就拒絕執行
        require(blacklist[msg.sender] == false, "you're blacklisted!");
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
    function deposit() public payable nonBlacklisted {
        // 用戶儲存以太幣，以獲得AU幣
        // 1. 取得用戶的地址
        address clientAddress = msg.sender;
        // 2. 取得用戶想要存入的以太幣數量
        uint256 depositAmount = msg.value;
        // 3. 知道用戶地址以及存入金額，我們要把AU幣紀錄在mapping裏面
        auBalance[clientAddress] += depositAmount; // address => uint mapping
        // 4. 發送deposit event
        emit DepositEvent(clientAddress, depositAmount, block.timestamp);
    }

    // 定義Withdraw function
    // 將會發送withdraw事件
    function withdraw(uint256 withdrawAmount) public nonBlacklisted {
        // 使用AU幣將以太幣提出來
        // 1. 取得用戶的地址
        address payable clientAddress = payable(msg.sender);
        // 2. 取得提款數量，並且扣掉用戶AU幣餘額
        auBalance[clientAddress] -= withdrawAmount;
        // 3. 把對應的以太幣打給用戶
        // 操作以太幣相關的事情需要用payable address才可以操作
        // 所以我們需要把clientAddress定義成payable
        // 見61行
        clientAddress.transfer(withdrawAmount); // 把合約裡面的以太幣轉到clientAddress裏面
        // 4. 發送withdraw event
        emit WithdrawEvent(clientAddress, withdrawAmount, block.timestamp);
    }

    // 定義Transfer function
    // 將會發送transfer事件
    // 把AU幣轉給其他人
    function transfer(address to, uint256 amount) public nonBlacklisted {
        // 1. 取得的用戶地址
        address clientAddress = msg.sender;
        // 2. 把AU幣從用戶地址轉到to地址
        // 更改打款方(用戶地址)的AU balance
        auBalance[clientAddress] -= amount;
        // 更改收款方的AU balance
        auBalance[to] += amount;
        // 3. 發送transfer event
        emit TransferEvent(clientAddress, amount, block.timestamp);
    }

    // 多寫一個：取得餘額
    function balanceOf(address addr) public view returns (uint256) {
        return auBalance[addr]; // address => uint
    }

    // mint: 管理員有絕對權限去鑄造AU幣
    // 鑄造給誰、鑄造多少金額AU幣
    // 只有管理員(Owner)可以呼叫這個函式
    function mint(address to, uint256 mintedAmount) public isOwner {
        // 1. 異動to address的AU balance
        auBalance[to] += mintedAmount;
    }

    // burn: 管理員有絕對權限去燒掉AU幣
    // 燒掉誰的、燒掉多少金額的AU幣
    // 只有管理員(Owner)可以呼叫這個函式
    function burn(address to, uint256 burntAmount) public isOwner {
        // 1. 異動to address的AU balance
        auBalance[to] -= burntAmount;
    }

    // blacklist: 管理員有絕對權限去管理黑名單
    // 決定要加入黑名單、或是解除黑名單
    // true: 加入黑名單
    // false: 移除黑名單
    // 只有管理員(Owner)可以呼叫這個函式
    function blacklisting(address to, bool blacklisted) public isOwner {
        blacklist[to] = blacklisted;
    }
}
