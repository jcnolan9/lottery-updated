const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require("web3")
const web3 = new Web3(ganache.provider())
const { abi, evm } = require('../compile')

let lottery
let accounts 

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object }).send({ from: accounts[0], gas: '1000000' })
})

describe('lottery contract', () => {
    it('verify contract deployed', () => {
        assert.ok(lottery.options.address)
    })
    

    it('allows account to enter lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.011', 'ether') 
            /*
            "value" property must be in wei
            web3.utils.toWei does conversion to wei 
            */
        })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        //works without putting { from: accounts[0] } in the call() function. Not sure why from:... is needed

        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    })

    it('allows multiple accounts to enter lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.011', 'ether') 
        }) 
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.011', 'ether') 
        }) 
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.011', 'ether') 
        }) 
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
       

        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])

        assert.equal(3, players.length)
    })

    it('requires a minimum amount of Eth to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '0' //0 wei
            })
            assert(false) //this will make sure the test fails if for some reason it passes the await statement above
        } catch(err) {
            assert(err) //assert.ok() check for existence, assert() checks for truthiness. Don't know the difference here
        }
    })

    it('only manager can call pickWinner()', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            })
            assert(false) //this will make sure the test fails if for some reason it passes the await statement above
        } catch(err) {
            assert(err) //assert.ok() check for existence, assert() checks for truthiness. Don't know the difference here
        }
    })

    it('sends money to winner and resets players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        })

        
        const initialBalance = await web3.eth.getBalance(accounts[0]) 
        //getBalance() used to get the balance of an account 

        await lottery.methods.pickWinner().send({ from: accounts[0]} )
        //send({ from: account[0] }) isn't only for when the function takes arguments
        //send() also need if changing state of the contract 
        //send() also needed if transcation must be sent by a particular address
        /*
        why don't we need to add the "gas:..." everytime we use send() though? 
        
            You do not need to specify gas or gasPrice when running tests on the ganache network as it has its own defaults. The only exception is if you were to exceed those limits which would require passing extra gasLimit and gasPrice options:

            https://github.com/trufflesuite/ganache/tree/master#options
        */

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        
        const finalBalance = await web3.eth.getBalance(accounts[0])

        
        const difference = finalBalance - initialBalance
        assert(difference > web3.utils.toWei('0.8', 'ether'))

        //console.log("Players array length: ", players.length)
        assert.equal(players.length, 0)

        assert.equal(await web3.eth.getBalance(lottery.options.address), 0)

    })
    
})