//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Message {
    uint256 totalMessages;

    // Generate random number
    uint256 private seed;

    event NewMessage(address indexed from, uint256 timestamp, string message);

    /* A custom datatype where to customize what to hold inside it. */
    struct MessageHere {
        address messageFrom; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    /* Declaring a variable to store an array of structs.*/
    MessageHere[] messages;

    /**
    This is an address => uint mapping, meaning I can associate an address with a number!
    In this case, I'll be storing the address with the last time the user messaged at us.
     */
    mapping(address => uint256) public lastMessagedAt;

    constructor() payable {
        console.log("I'm a Smart Contract!");

        // initial seed
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function message(string memory _message) public {
        /** Current timestamp is at least 15-minutes bigger than the last timestamp we stored */
        require(
            lastMessagedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30 seconds"
        );

        // Update current timestamp
        lastMessagedAt[msg.sender] = block.timestamp;

        totalMessages += 1;
        console.log("%s has messaged!", msg.sender, _message);

        messages.push(MessageHere(msg.sender, _message, block.timestamp));

        /* Generate a new seed for the next user that sends a message */
        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        /* Give 50% chance that a user win the prize */
        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            uint256 prizeValue = 0.0001 ether;
            require(
              prizeValue <= address(this).balance,
              "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeValue}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewMessage(msg.sender, block.timestamp, _message);
    }

    function getAllMessages() public view returns (MessageHere[] memory) {
        return messages;
    }

    function getTotalMessages() public view returns (uint256) {
        console.log("We have %d total messages!", totalMessages);
        return totalMessages;
    }
}
