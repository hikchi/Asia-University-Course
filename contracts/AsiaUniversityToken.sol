// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AsiaUniversityToken is ERC20 {
    constructor() ERC20("AsiaUniversityToken", "AUT") {
        // 發出去100顆AUT
        // 實際上我們在合約，需要操作到100 * 10 ** 18這麼多顆
        _mint(msg.sender, 100 * (10**decimals()));
    }
}
