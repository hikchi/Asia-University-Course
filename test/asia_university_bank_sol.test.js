const asiaUniversityBank = artifacts.require("AsiaUniversityBank");
const truffleAssert = require('truffle-assertions');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("AsiaUniversityBank", function (accounts) {
  let owner, nonOwner
  let user, blacklistedUser
  let receiverUser

  let asiaUniversityBankInstance

  // 初始化一些參數
  const decimal = 10 ** 18
  const mintedAmount = 100 * decimal
  const burntAmount = 10 * decimal
  const transferredAmount = 10 * decimal
  const withdrawedAmount = 1 * decimal
  const depositedAmount = 1 * decimal

  before(async function () {
    // 取得AU Bank合約實例
    asiaUniversityBankInstance = await asiaUniversityBank.deployed();
    // 設定owner跟nonOwner地址
    owner = accounts[0]
    nonOwner = accounts[1]
    // 設定user, blacklistedUser地址
    user = accounts[2]
    blacklistedUser = accounts[3]
    // 設定receiver user
    receiverUser = accounts[4]
    // 將blacklistedUser先黑單
    await asiaUniversityBankInstance.blacklisting(blacklistedUser, true, {
      from: owner
    })
  });

  context("Mint Funtionalities Testing", function () {
    it("owner should successfully mint AU Token to a user", async function () {
      // 從owner發送交易
      // 在truffle裡面，可以用字串當數字傳入，免除overflow的問題
      const tx = await asiaUniversityBankInstance.mint(user, mintedAmount.toString(), {
        from: owner
      })
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount, "unmatched balance when minting")
    });

    it("owner shouldn't mint to a blacklisted user", async function () {
      // 從非owner發送mint交易應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.mint(user, mintedAmount.toString(), { from: nonOwner }),
        "Caller is not owner",
      )
    });
  })

  context("Burn Funtionalities Testing", function () {
    it("owner should successfully burn AU Token to a user", async function () {
      // 從owner發送交易
      // 在truffle裡面，可以用字串當數字傳入，免除overflow的問題
      const tx = await asiaUniversityBankInstance.burn(user, burntAmount.toString(), {
        from: owner
      })
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount - burntAmount, "unmatched balance when burning")
    });

    it("non-owner shouldn't burn to a user", async function () {
      // 從非owner發送burn交易應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.burn(user, burntAmount.toString(), { from: nonOwner }),
        "Caller is not owner",
      )
    });
  })

  context("Blacklisting Funtionalities Testing", function () {
    it("owner should be able to put a user into blacklist", async function () {
      // 從owner發送交易
      const tx = await asiaUniversityBankInstance.blacklisting(user, true, {
        from: owner
      })
      // 確認黑名單情況，應為true
      const blacklisted = await asiaUniversityBankInstance.blacklist(user)
      assert.equal(blacklisted, true, "blacklist status should be true")
    });

    it("owner should be able to remove a user from blacklist", async function () {
      // 從owner發送交易
      const tx = await asiaUniversityBankInstance.blacklisting(user, false, {
        from: owner
      })
      // 確認黑名單情況，應為false
      const blacklisted = await asiaUniversityBankInstance.blacklist(user)
      assert.equal(blacklisted, false, "blacklist status should be false")
    });

    it("non-owner should be able to remove a user from blacklist", async function () {
      // 從非owner發送blacklisting交易應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.blacklisting(user, true, { from: nonOwner }),
        "Caller is not owner",
      )
    });
  })

  context("Balance Funtionalities Testing", function () {
    it("everyone should be able to checke AU Token balance", async function () {
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount - burntAmount, "unmatched balance")
    });

    it("everyone(blacklisted user) should be able to checke AU Token balance", async function () {
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(blacklistedUser)
      assert.equal(balance, 0, "unmatched balance")
    });
  })

  context("Deposit Funtionalities Testing", function () {
    it("user should be able to deposit its AU Toekn", async function () {
      // 取得提款前的ETH餘額，為了檢查提款後的情況
      const originalEthBalance = await web3.eth.getBalance(user)
      // 發送withdraw交易
      const tx = await asiaUniversityBankInstance.deposit({
        from: user,
        value: depositedAmount,
      })
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount - burntAmount + depositedAmount, "unmatched balance when depositing")
      // 取得提款後的ETH餘額，並額外檢查
      const finalEthBalance = await web3.eth.getBalance(user)
      assert.isTrue(finalEthBalance - originalEthBalance < 0, "wrong ETH balance")
    });

    it("blacklisted user shouldn't be able to deposit its ETH", async function () {
      // 黑名單用戶deposit應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.deposit({ from: blacklistedUser, value: depositedAmount }),
        "you're blacklisted!",
      )
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(blacklistedUser)
      assert.equal(balance, 0, "unmatched balance when depositing from blacklisted user")
    });
  })

  context("Withdraw Funtionalities Testing", function () {
    it("user should be able to withdraw its ETH", async function () {
      // 取得提款前的ETH餘額，為了檢查提款後的情況
      const originalEthBalance = await web3.eth.getBalance(user)
      // 發送withdraw交易
      const tx = await asiaUniversityBankInstance.withdraw(withdrawedAmount.toString(), { from: user })
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount - burntAmount + depositedAmount - withdrawedAmount, "unmatched balance when withdrawing")
      // 取得提款後的ETH餘額，並額外檢查
      const finalEthBalance = await web3.eth.getBalance(user)
      assert.isTrue(finalEthBalance - originalEthBalance > 0, "wrong ETH balance")
    });

    it("blacklisted user shouldn't be able to transfer its AU Token", async function () {
      // 黑名單用戶withdraw應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.withdraw(withdrawedAmount.toString(), { from: blacklistedUser }),
        "you're blacklisted!",
      )
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(blacklistedUser)
      assert.equal(balance, 0, "unmatched balance when withdrawing from blacklisted user")
    });
  })

  context("Transfer Funtionalities Testing", function () {
    it("user should be able to transfer its AU Token", async function () {
      // 發送transfer交易
      const tx = await asiaUniversityBankInstance.transfer(receiverUser, transferredAmount.toString(), { from: user })
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(user)
      assert.equal(balance, mintedAmount - burntAmount - transferredAmount, "unmatched balance when transferring")
    });

    it("blacklisted user shouldn't be able to transfer its AU Token", async function () {
      // 黑名單用戶transfer應該要拒絕
      // 檢查是否拒絕，且回傳對的錯誤訊息
      await truffleAssert.reverts(
        asiaUniversityBankInstance.transfer(receiverUser, transferredAmount.toString(), { from: blacklistedUser }),
        "you're blacklisted!",
      )
      // 確認AU餘額
      const balance = await asiaUniversityBankInstance.balanceOf(blacklistedUser)
      assert.equal(balance, 0, "unmatched balance when transferring from blacklisted user")
    });
  })
});
