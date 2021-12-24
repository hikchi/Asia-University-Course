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
      const AsiaUniversityBankAddress = "<改成自己部署的地址>";

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
      // 需要轉換成AU幣的單位，也就是10**18，因此要傳的是withdrawAmountInWei
      App.contracts.AsiaUniversityBank.methods.withdraw(withdrawAmountInWei).send({
        // 從目前連接的帳戶發送交易
        from: account,
      }).then(function (receipt) {
        alert("提款成功！")
        // 再次確認AU幣的餘額
        return App.getBalances()
      }).catch(function (error) {
        console.log(error.message)
      })

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
      // 取得合約實例
      // 發送合約deposit函式
      App.contracts.AsiaUniversityBank.methods.deposit().send({
        // 從目前連接的帳戶發送交易
        from: account,
        // value: 這筆交易我要送多少ETH進去，合約會以msg.value呈現
        // [Important] 單位要用wei，不可以用ether
        value: depositAmountInWei,
      }).then(function (receipt) {
        alert("存款成功！")
        // 再次確認AU幣的餘額
        return App.getBalances()
      }).catch(function (error) {
        console.log(error.message)
      })

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
      // 需要轉換成AU幣的單位，也就是10**18，因此要傳的是mintedAmountInWei
      App.contracts.AsiaUniversityBank.methods.mint(mintedAddress, mintedAmountInWei).send({
        // 從目前連接的帳戶發送交易
        from: account,
      }).then(function (receipt) {
        alert("鑄幣成功！")
        // 再次確認AU幣的餘額
        return App.getBalances()
      }).catch(function (error) {
        console.log(error.message)
      })

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
  // 取得用戶的AU幣的餘額
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
      // 怎麼做呢？
      // 1. 取得合約實例
      // 2. 呼叫balanceOf函式
      // App.contracts.AsiaUniversityBank
      App.contracts.AsiaUniversityBank.methods.balanceOf(account).call()
        .then(function (result) {
          // 一單位的AU幣實際上是10的18次方，顯示的時候需要把單位除回去
          const balance = result / 10 ** 18
          console.log(balance)
          // 把id為AUBalance的HTML元件抓出來，並且改變他的文字(text)
          $('#AUBalance').text(balance)
        }).catch(function (error) {
          console.log(error.message)
        })

    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
