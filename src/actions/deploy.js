import Rx from 'rxjs/Rx';
import { XMLHttpRequest } from 'xmlhttprequest';

import { getMetamaskError, isTestnetOrMainnet } from '../util/utils';

/**
 *
 * @param {web3} web3
 * @param {*} contractSpecs  Specs of new contract to be deployed
 * @param {*} MarketContractRegistry marketContractRegistryProvider
 * @param {*}
 */
export function deployContract(
  { web3, contractSpecs, network },
  { MarketContractRegistry, MarketContract, MarketCollateralPool, MarketToken }
) {
  const type = 'DEPLOY_CONTRACT';

  return function(dispatch) {
    return new Promise((resolve, reject) => {
      dispatch({ type: `${type}_PENDING` });
      // Double-check web3's status
      if (web3 && typeof web3 !== 'undefined') {
        // create array to pass to MARKET contract constructor
        const contractConstructorArray = [
          contractSpecs.priceFloor,
          contractSpecs.priceCap,
          contractSpecs.priceDecimalPlaces,
          contractSpecs.qtyMultiplier,
          contractSpecs.expirationTimeStamp
        ];

        // Get current ethereum wallet.
        web3.eth.getCoinbase((error, coinbase) => {
          // Log errors, if any
          // TODO(perfectmak): handle this error
          if (error) {
            console.error(error);
          }

          console.log('Attempting to deploy contract from ' + coinbase);

          // find the address of the MKT token so we can link to our deployed contract
          let marketContractInstanceDeployed;

          let txParams = {
            gasPrice: web3.toWei(contractSpecs.gasPrice, 'gwei'),
            from: coinbase
          };

          if (contractSpecs.gas && !isTestnetOrMainnet(network)) {
            txParams.gas = contractSpecs.gas;
          }

          MarketToken.deployed()
            .then(function(marketTokenInstance) {
              return MarketContract.new(
                contractSpecs.contractName,
                marketTokenInstance.address,
                contractSpecs.baseTokenAddress,
                contractConstructorArray,
                contractSpecs.oracleDataSource,
                contractSpecs.oracleQuery,
                txParams
              );
            })
            .then(function(marketContractInstance) {
              marketContractInstanceDeployed = marketContractInstance;
              return MarketCollateralPool.new(
                marketContractInstance.address,
                txParams
              );
            })
            .then(function(marketCollateralPoolInstance) {
              return marketContractInstanceDeployed.setCollateralPoolContractAddress(
                marketCollateralPoolInstance.address,
                txParams
              );
            })
            .then(function() {
              return MarketContractRegistry.deployed();
            })
            .then(function(marketContractRegistryInstance) {
              // Rinkeby
              if (network === 'rinkeby') {
                // Add deployed contract address to whitelist
                Rx.Observable.ajax({
                  url: 'https://api.marketprotocol.io/contracts/whitelist',
                  method: 'POST',
                  body: { address: marketContractInstanceDeployed.address },
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  responseType: 'json',
                  crossDomain: true,
                  createXHR: () => new XMLHttpRequest()
                })
                  .catch(
                    err =>
                      err.xhr
                        ? Rx.Observable.of(err)
                        : Rx.Observable.of('.___.')
                  )
                  .map(data => data.response)
                  .subscribe(res => console.log(res));
              } else {
                marketContractRegistryInstance.addAddressToWhiteList(
                  marketContractInstanceDeployed.address,
                  txParams
                );
              }

              dispatch({
                type: `${type}_FULFILLED`,
                payload: marketContractInstanceDeployed
              });

              resolve(marketContractInstanceDeployed);
            })
            .catch(err => {
              dispatch({
                type: `${type}_REJECTED`,
                payload: getMetamaskError(err.message.split('\n')[0])
              });

              reject(getMetamaskError(err.message.split('\n')[0]));
            });
        });
      } else {
        dispatch({
          type: `${type}_REJECTED`,
          payload: { error: 'Web3 not initialised' }
        });

        reject('Web3 not initialised');
      }
    });
  };
}
