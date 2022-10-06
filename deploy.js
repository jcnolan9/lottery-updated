const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
  'wonder globe aerobic combine way poem immense guilt frown marriage insane hover',
  // remember to change this to your own phrase!
  'https://rinkeby.infura.io/v3/1bccd90e53de4153b124fcf4fa6a5d2a'
  // remember to change this to your own endpoint!
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(JSON.stringify(abi))
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
