App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) { // 與新的 metamask 互動 (EIP-1193 -> 2018 規範)
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable(); // 詢問使用者是否授權 access
        /* 偵測Metamask有沒有偵測換地址這件事情，如果有的話，重新載入網頁 */
        window.ethereum.on('accountsChanged', function (accounts) {
          window.location.reload()
        })
      } catch (error) {
        console.error("User denied account access") // 使用者拒絕
      }
    } else if (window.web3) { // 舊版的互動方式
      App.web3Provider = window.web3.currentProvider;
    } else { // 都沒有就本地端 Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('AsiaUniversityBank.json', function (data) {
      // 取得編譯過後的相關資料
      // const AsiaUniversityBankArtifact = data;
      // 取得合約地址
      const AsiaUniversityBankAddress = "0xcBa34b7Ed4001b636EC5A4EFD45917D6e363484A";

      // [Web3]] 初始化合約
      // 需要合約的ABI, 跟地址(address)
      App.contracts.AsiaUniversityBank = new web3.eth.Contract(data.abi, AsiaUniversityBankAddress)


      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#withdrawButton', App.handleWithdraw);
    $(document).on('click', '#depositButton', App.handleDeposit);
    $(document).on('click', '#mintButton', App.handleMint);
    $(document).on('click', '#burnButton', App.handleBurn);
    $(document).on('click', '#blacklistButton', App.handleBlacklist);
  },

  handleTransfer: function (event) {
    event.preventDefault();

    var amount = parseInt($('#AUTransferAmount').val());
    var toAddress = $('#AUTransferAddress').val();

    console.log('Transfer ' + amount + ' AU to ' + toAddress);

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      const account = accounts[0];

      const amountInWei = web3.utils.toWei(`${amount}`, 'ether');
      // [Web3] 

    });
  },

  handleWithdraw: function (event) {
    event.preventDefault();

    const withdrawAmount = parseInt($('#AUWithdrawAmount').val());

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      console.log('Withdraw ' + withdrawAmount + ' AU to ' + account);

      const withdrawAmountInWei = web3.utils.toWei(`${withdrawAmount}`, 'ether');

      // [Web3] 

    });
  },

  handleDeposit: function (event) {
    event.preventDefault();

    const depositAmount = parseInt($('#AUDepositAmount').val());

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      console.log('Deposit ' + depositAmount + ' ETH to ' + account);

      const depositAmountInWei = web3.utils.toWei(`${depositAmount}`, 'ether');
      // [Web3] 

    });
  },

  handleMint: function (event) {
    event.preventDefault();

    const mintedAddress = $('#AUMintedAddress').val();
    const mintedAmount = parseInt($('#AUMintedAmount').val());

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      console.log('Mint ' + mintedAmount + ' AU to ' + account);

      const mintedAmountInWei = web3.utils.toWei(`${mintedAmount}`, 'ether');
      // [Web3] 

    });
  },

  handleBurn: function (event) {
    event.preventDefault();

    const burntAddress = $('#AUBurntAddress').val();
    const burntAmount = parseInt($('#AUBurntAmount').val());

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      console.log('Burn ' + burntAmount + ' AU for ' + account);

      const burntAmountInWei = web3.utils.toWei(`${burntAmount}`, 'ether');
      // [Web3] 

    });
  },

  handleBlacklist: function (event) {
    event.preventDefault();

    const blacklistAddress = $('#AUBlacklistAddress').val();
    const blacklistType = $('#AUBlacklistType').val();

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      const blacklistBool = blacklistType.toString().toLowerCase() === "true";

      console.log('Blacklist ' + blacklistAddress + ' into ' + blacklistBool);

      // [Web3] 

    });
  },

  getBalances: function () {
    console.log('Getting balances...');

    let AsiaUniversityBankInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];
      console.log("Current account", { account })

      // [Web3] 取得你的餘額
      // 需要先在Metamask新增自己在Ganache的帳戶

    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
