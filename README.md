# Synthetix Stacking Replica

## Usage

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
yarn add hardhat
yarn add hardhat-docgen
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ npx hardhat compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn run typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ npx hardhat test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn add hardhat-coverage
$ npx hardhat coverage --testfiles "./test"
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ npx hardhat clean
```

### Deploy

Deploy the contracts to Rinkeby Network:

Token Contract
```sh
$ npx hardhat deploy:SynthetixToken --network rinkeby <name of token> <symbol of token>
```

Stacking Contract
```sh
$ npx hardhat deploy:SynthetixContractStaking --network rinkeby <address of token>
```


### Verify Contract

Verify the contracts on Etherscan programatically:

Token Contract
```sh
$ npx hardhat verify <address_of_the_deployed_token_contract> --network rinkeby <name_of_the_token> <symbol_of_the_token> 
```

Stacking Contract
```sh
$ npx hardhat verify <address_of_the_deployed_stacking_contract> --network rinkeby <address_of_token_used_on_deployment>
```

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the [hardhat-vscode](https://github.com/NomicFoundation/hardhat-vscode) extension.
