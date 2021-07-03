import { Injectable } from "@angular/core";
import Web3 from "web3";
import TruffleContract from "truffle-contract";
import homeTransactionAbi from "../../contracts/HomeTransaction.json";

declare let require: any;
declare let window: any;

let factoryAbi = require("../../contracts/Factory.json");
let contractAbi = require("../../contracts/HomeTransaction.json");

@Injectable({
  providedIn: "root",
})
export class EthcontractService {
  private web3Provider = null;
  public web3: any;
  contracts: any[] = [];

  public homeTransactions: any[] = [];

  constructor() {
    if (window.ethereum === undefined) {
      alert("Non-Ethereum browser detected. Install MetaMask");
    } else {
      if (typeof window.web3 !== "undefined") {
        this.web3 = window.web3.currentProvider;
      } else {
        this.web3 = new Web3.providers.HttpProvider("http://localhost:7545");
      }
      window.web3 = new Web3(window.ethereum);
      this.enableMetaMaskAccount();
    }
  }

  private async enableMetaMaskAccount(): Promise<any> {
    let enable = false;
    await new Promise((resolve, reject) => {
      enable = window.ethereum.enable();
    });
    return Promise.resolve(enable);
  }

  getAccountInfo() {
    return new Promise((resolve, reject) => {
      window.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          window.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              return resolve({ fromAccount: account });
            } else {
              return reject("error!");
            }
          });
        }
      });
    });
  }

  getProperts(ownerAddr, myAddr) {
    return new Promise((resolve, reject) => {
      let factoryContract = TruffleContract(factoryAbi);
      factoryContract.setProvider(this.web3);

      factoryContract
        .deployed()
        .then(function (instance) {
          return instance.getProperties(ownerAddr, {
            from: myAddr,
          });
        })
        .then(function (message) {
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);

          return reject("Error in transferEther service call");
        });
    });
  }

  getContracts(Addr) {
    return new Promise((resolve, reject) => {
      let factoryContract = TruffleContract(factoryAbi);
      factoryContract.setProvider(this.web3);

      factoryContract
        .deployed()
        .then(function (instance) {
          return instance.getInstances({
            from: Addr,
          });
        })
        .then(function (message) {
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });
    });
  }

  // async loadContracts() {
  //   if (this.contracts.length > 0) {
  //     for (let i = 0; i < this.contracts.length; i++) {
  //       const addressOfContract = this.contracts[i];
  //       this.web3 = window.web3.currentProvider;
  //       let transactionContract = await TruffleContract(
  //         contractAbi,
  //         addressOfContract
  //       );
  //       transactionContract.setProvider(this.web3);

  //       transactionContract.methods.contractState().call();
  //     }
  //   }
  // }

  // async loadContract(addr) {
  //   this.web3 = window.web3.currentProvider;

  //   return new Promise((resolve, reject) => {
  //     let transactionContract = new window.web3.eth.Contract(
  //       homeTransactionAbi.abi,
  //       addr
  //     );
  //     transactionContract.setProvider(this.web3);

  //     transactionContract.methods
  //       .buyer()
  //       .call()
  //       .then(function (message) {
  //         // console.log(message);
  //         return resolve(message);
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //         return reject("Error in transferEther service call");
  //       });
  //   });
  // }

  createContract(addr, form) {
    return new Promise((resolve, reject) => {
      let factoryContract = TruffleContract(factoryAbi);
      factoryContract.setProvider(this.web3);
      console.log(factoryContract);

      factoryContract
        .deployed()
        .then(function (instance) {
          return instance.createContract(
            "1",
            "5",
            "30",
            "0xBafE6569253963a96BC1791054743A6eBEcfA396",
            "0xD50F5fd4CBA7185cf7Bea0b1f0191B11D970928c",
            {
              from: addr,
            }
          );
        })
        .then(function (message) {
          console.log(message);
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });
    });
  }

  contractType(contractAddr, myAddr) {
    this.web3 = window.web3.currentProvider;

    return new Promise(async (resolve, reject) => {
      let transactionContract = new window.web3.eth.Contract(
        homeTransactionAbi.abi,
        contractAddr
      );
      transactionContract.setProvider(this.web3);

      await transactionContract.methods
        .buyer()
        .call()
        .then(function (message) {
          if (message.toLowerCase() === myAddr.toLowerCase()) {
            return resolve(1);
          }
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });

      await transactionContract.methods
        .seller()
        .call()
        .then(function (message) {
          if (message.toLowerCase() === myAddr.toLowerCase()) {
            return resolve(2);
          }
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });

      await transactionContract.methods
        .realtor()
        .call()
        .then(function (message) {
          if (message.toLowerCase() === myAddr.toLowerCase()) {
            return resolve(3);
          }
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });

      return resolve(0);
    });
  }

  getPropertyIdFromContract(addr){
    return new Promise((resolve, reject) => {
      let transactionContract = new window.web3.eth.Contract(
        homeTransactionAbi.abi,
        addr
      );
      transactionContract.setProvider(this.web3);

      transactionContract.methods
        .propertyId()
        .call()
        .then(function (message) {
          // console.log(message);
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });
    });
  }

  getPropertyFromId(id){
    return new Promise((resolve, reject) => {
      let factoryContract = TruffleContract(factoryAbi);
      factoryContract.setProvider(this.web3);
      console.log(factoryContract);

      factoryContract
        .deployed()
        .then(function (instance) {
          return instance.getProperty(id);
        })
        .then(function (message) {
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });
    });
  }

  getContractState(addr){
    return new Promise((resolve, reject) => {
      let transactionContract = new window.web3.eth.Contract(
        homeTransactionAbi.abi,
        addr
      );
      transactionContract.setProvider(this.web3);

      transactionContract.methods
        .contractState()
        .call()
        .then(function (message) {
          // console.log(message);
          return resolve(message);
        })
        .catch(function (error) {
          console.log(error);
          return reject("Error in transferEther service call");
        });
    });
  }
}
