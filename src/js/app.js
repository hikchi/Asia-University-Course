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
    $.getJSON('AsiaUniversityBankSol.json', function (data) {
      // $.getJSON('AsiaUniversityBank.json', function (data) {
      // 取得編譯過後的相關資料
      const AsiaUniversityBankArtifact = data;
      // 取得合約地址
      const AsiaUniversityBankAddress = "0xA79dD7eAf6C0c5a8e5e9Ea738f7e3090765AC376";

      // [Web3]] 初始化合約
      App.contracts.AsiaUniversityBank = new web3.eth.Contract(AsiaUniversityBankArtifact.abi, AsiaUniversityBankAddress)

      // [Truffle] 初始化合約
      // App.contracts.AsiaUniversityBank = TruffleContract(AsiaUniversityBankArtifact);

      // [Truffle] 將provider指定給AsiaUniversityBank參數
      // App.contracts.AsiaUniversityBank.setProvider(App.web3Provider);

      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#withdrawButton', App.handleWithdraw);
    $(document).on('click', '#depositButton', App.handleDeposit);
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
      console.log({ toAddress, amount })
      const account = accounts[0];

      const amountInWei = web3.utils.toWei(`${amount}`, 'ether');
      // [Web3] 
      App.contracts.AsiaUniversityBank.methods.transfer(toAddress, amountInWei).send({ from: account })
        .then(function (receipt) {
          console.log(receipt)
          alert('Transfer Successful!');
          return App.getBalances();
        }).catch(function (err) {
          console.log(err.message);
        });

      // [Truffle]
      // App.contracts.AsiaUniversityBank.deployed().then(function (instance) {
      //   AsiaUniversityBankInstance = instance;

      //   return AsiaUniversityBankInstance.transfer(toAddress, amount, { from: account, gas: 100000 });
      // }).then(function (result) {
      //   alert('Transfer Successful!');
      //   return App.getBalances();
      // }).catch(function (err) {
      //   console.log(err.message);
      // });
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
      App.contracts.AsiaUniversityBank.methods.withdraw(withdrawAmountInWei).send({ from: account })
        .then(function (receipt) {
          alert('Withdraw Successful!');
          return App.getBalances();
        }).catch(function (err) {
          console.log(err.message);
        });

      // [Truffle]
      // App.contracts.AsiaUniversityBank.deployed().then(function (instance) {
      //   AsiaUniversityBankInstance = instance;

      //   return AsiaUniversityBankInstance.withdraw({ from: account, gas: 100000 });
      // }).then(function (result) {
      //   alert('Withdraw Successful!');
      //   return App.getBalances();
      // }).catch(function (err) {
      //   console.log(err.message);
      // });
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
      App.contracts.AsiaUniversityBank.methods.deposit().send({ from: account, value: depositAmountInWei })
        .then(function (receipt) {
          alert('Deposit Successful!');
          return App.getBalances();
        }).catch(function (err) {
          console.log(err.message);
        });

      // [Truffle]
      // App.contracts.AsiaUniversityBank.deployed().then(function (instance) {
      //   AsiaUniversityBankInstance = instance;

      //   return AsiaUniversityBankInstance.deposit({ from: account, gas: 100000 });
      // }).then(function (result) {
      //   alert('Deposit Successful!');
      //   return App.getBalances();
      // }).catch(function (err) {
      //   console.log(err.message);
      // });
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
      App.contracts.AsiaUniversityBank.methods.balanceOf(account).call()
        .then(function (result) {
          balance = result / 10 ** 18;
          $('#AUBalance').text(balance);
        }).catch(function (err) {
          console.log(err.message);
        });

      // [Truffle]
      // App.contracts.AsiaUniversityBank.deployed().then(function(instance) {
      //   AsiaUniversityBankInstance = instance;

      //   return AsiaUniversityBankInstance.balanceOf(account);
      // }).then(function(result) {
      //   balance = result.c[0];

      //   $('#AUBalance').text(balance);
      // }).catch(function(err) {
      //   console.log(err.message);
      // });
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
