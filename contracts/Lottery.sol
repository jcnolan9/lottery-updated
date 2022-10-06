//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager; 
    string public myString;
    address payable[] public players;
    
    /*
    msg object is available for every function call or transaction attempt
    msg.data - source code and/or function arguments
    msg.gas - amount of gas available to us to run some code aka the gas the current function invokation has available to it
    msg.sender - address of the account that started the current function invocation
    msg.value - amount of ether (in wei) sent along with the function invocation

    */


    constructor() {
        manager = msg.sender;
    }

    /*
    function types
        public - anyone can call the function 
        private - only this contract can call the function
        view or constant (old way) - returns data and does not modify the contract's data 
        pure - will not read or modify the contract's data
        payable - when someone calls this function amy send Ether 
    */

    function enter() public payable {
        require(msg.value > 0.01 ether); //adding "ether" converts the number in front to wei
        /*
        "require" takes an expression that evaluates to true or false
        if the expression evaluates to false the rest of the function does not run
        if the expression evaluates to true then the rest of the function executes
        */

        players.push(payable(msg.sender));
    }
    //have to mark the function as 'payable' whenever expecting someone to send Ether

    function random() private view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
        //sha3 is a global function that is always available
        //keccak256() is also available
        //keccak256 is a class of  algorithm and sha3 is a particular implementation of  it
        //block and now are global variables  
        //looks like we cast the hash to an unit
    }

    function pickWinner() public restricted{
        //require(msg.sender == manager);
        
        uint index  = random() % players.length;
        players[index].transfer(address(this).balance);
        //transer() function is available on every address
        //units of wei taken as a parameter
        //this.balance - this refers to this contract and balance means the contract's entire balance of money 
    
        players = new address payable[](0);
        //zeros out the array after picking a winner
        //"(0)" at the end tells Solidity that the array should have 0 elements 
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    //can add "restricted" to any other function and the requirement
    //that the msg sender be the manager will be imposed
    //the "_" means run all the rest of the code inside the function

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    } 
}