// SPDX-License-Identifier: GPL-3.0

// 定義版本
pragma solidity >=0.7.0 <0.9.0;

// Imports
// 假設Owner就是管理員
import "./Owner.sol";

// interface 設計
interface IAsiaUniversityBank {
    function deposit() external;
    function withdraw(uint withdrawAmount) external;
    function transfer(address to, uint amount) external;
    function mint(address to, uint mintAmount) external;
    function burn(address to, uint burnAmount) external;
    function modifyBlacklist(address to, bool _blacklisted) external;
}

// Contract主程式碼區塊
contract AsiaUniversityBankSol is Owner {
    // 需要去記錄每個人的AU幣餘額
    mapping(address => uint256) auBalance;
    // 需要去記錄每個人的黑名單狀態
    mapping(address => bool) blacklist;

    // 修改器：確認誰不是黑名單人員
    modifier nonBlacklisted() {
        // 取得“誰”要被確認
        address sender = msg.sender;
        // 取得某個人的黑名單狀態
        bool blacklisted = blacklist[sender];
        // 如果他不是黑名單的話，才可以繼續執行"之後的程式碼"
        // require(blacklisted == false)
        require(!blacklisted, "the sender is blacklisted");
        // 所謂之後的程式碼
        _;
    }
    
    // 定義events
    // #1 Deposit event: 知道誰在什麼時候存了多少錢
    event DepositEvent(address indexed who, uint depositAmount, uint timestemp);
    // #2 Withdraw event: 知道誰在什麼時候提了多少錢
    event WithdrawEvent(address indexed who, uint256 withdrawAmount, uint256 timestamp);
    // #3 Transfer event: 知道誰在什麼時候轉給了誰多少錢
    event TransferEvent(address indexed from, address indexed to, uint256 transferAmount, uint256 timestamp);
    // #4 Mint event: 知道管理員在什麼時候鑄給誰多少錢
    event MintEvent(address indexed toWhom, uint256 mintedAmount, uint256 timestamp);
    // #5 Burn event: 知道管理員在什麼時候燒掉誰多少錢
    event BurnEvent(address indexed toWhom, uint256 burntAmount, uint256 timestamp);
    // #6 Blacklist event: 知道管理員在什麼時候異動黑名單
    event BlacklistEvent(address indexed toWhom, bool blacklisted, uint256 timestamp);

    // 定義Deposit function
    // 將會發送deposit事件
    function deposit() public payable nonBlacklisted {
        // 取得“誰”要存款
        address sender = msg.sender;
        // 取得“要存”多少錢
        uint256 depositAmount = msg.value; // 單位: 以太幣ETH
        // 將存進來的錢(depositAmount)記錄到我們的“餘額”裏面
        auBalance[sender] = auBalance[sender] + depositAmount;
        // 發送deposit事件
        emit DepositEvent(sender, depositAmount, block.timestamp);
    }

    // 定義Withdraw function
    // 將會發送withdraw事件
    function withdraw(
        uint256 withdrawAmount /* 我要提100塊錢 */
    ) public nonBlacklisted {
        // 取得"誰"要提款
        address sender = msg.sender;
        // 取得"要提"多少錢
        // 已知是withdrawAmount參數
        // 將提款的錢(withdrawAmount)記錄到我們的“餘額”裡面
        auBalance[sender] = auBalance[sender] - withdrawAmount;
        // 使用AU幣，提出我們已經存入的以太幣(從合約->sender)
        payable(sender).transfer(withdrawAmount);
        // 範例方式(也是轉帳以太幣，現階段不建議使用)
        // (bool sent, ) = sender.call{value: withdrawAmount}("");
        // require(sent, "Failed to send Ether");
        // 發送withdraw事件
        emit WithdrawEvent(sender, withdrawAmount, block.timestamp);
    }

    // 定義Transfer function
    // 將會發送transfer事件
    function transfer(address to, uint256 amount) public nonBlacklisted {
        // 取得“誰”要轉帳
        address sender = msg.sender;
        // 取得”收款者“的地址、同時取得轉帳金額
        // 已知被轉帳者地址為to, 轉帳金額是amount

        // 更改餘額 -> 轉帳者要扣錢、收款者要加錢
        auBalance[sender] = auBalance[sender] - amount;
        auBalance[to] = auBalance[to] + amount;
        // 發送transfer事件
        emit TransferEvent(sender, to, amount, block.timestamp);
    }

    // 管理員鑄幣
    function mint(address to, uint amount) public isOwner {
        // 本質上就是把餘額無條件增加
        // 取得“誰”可以接收這筆錢，同時可以mint多少錢
        // msg.sender? 根據邏輯這一定會是管理員地址，然而需求是“針對不特定地址”
        auBalance[to] = auBalance[to] + amount;
        // 發送mint事件
        emit MintEvent(to, amount, block.timestamp);
    }

    // 管理員燒幣
    function burn(address to, uint amount) public isOwner {
        // 本質上就是把餘額無條件減少
        // 取得“誰”會被燒這筆錢，同時可以burn多少錢
        // msg.sender? 根據邏輯這一定會是管理員地址，然而需求是“針對不特定地址”
        auBalance[to] = auBalance[to] - amount;
        // 發送burn事件
        emit BurnEvent(to, amount, block.timestamp);
    }

    // 管理員加入黑名單
    function modifyBlacklist(address to, bool _blacklisted) public isOwner {
        // 把某一個地址加入、或者移除黑名單
        // 取得“誰”要被加入、移除黑名單
        // 把此地址加入、還是移除黑名單?
        blacklist[to] = _blacklisted;
        // 發送blacklist事件
        emit BlacklistEvent(to, _blacklisted, block.timestamp);
    }

    // 新增餘額
    function balanceOf(address addr) public view returns (uint256) {
        return auBalance[addr]; // address => uint
    }
}
