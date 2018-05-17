import { getMetamaskError } from '../util/utils';

export function testQuery({ web3, querySpecs }, { QueryTest }) {
  const type = 'TEST_QUERY';

  return function(dispatch) {
    return new Promise((resolve, reject) => {
      dispatch({ type: `${type}_PENDING` });

      if (web3 && typeof web3 !== 'undefined') {
        // Get current ethereum wallet.
        web3.eth.getCoinbase((error, coinbase) => {
          if (error) {
            console.error(error);
            dispatch({
              type: `${type}_REJECTED`,
              payload: getMetamaskError(error.message.split('\n')[0])
            });
            return reject(getMetamaskError(error.message.split('\n')[0]));
          }

          console.log('Attempting to submit test query from ' + coinbase);
          let queryTestContractInstance;

          QueryTest.deployed()
            .then(function(queryTestContract) {
              queryTestContractInstance = queryTestContract;
              return queryTestContractInstance.getQueryCost.call(
                querySpecs.oracleDataSource
              );
            })
            .then(function(queryCost) {
              let txParams = {
                gasPrice: web3.toWei(querySpecs.gasPrice, 'gwei'),
                from: coinbase,
                value: queryCost
              };

              if (querySpecs.gas) {
                txParams.gas = querySpecs.gas;
              }

              return queryTestContractInstance.testOracleQuery(
                querySpecs.oracleDataSource,
                querySpecs.oracleQuery,
                txParams
              );
            })
            .then(function(queryTransactionResults) {
              dispatch({
                type: `${type}_TRANSACTION_PENDING`,
                payload: queryTransactionResults.tx
              });

              let queryEventIds = queryTransactionResults.logs
                .filter(({ event }) => event === 'QueryScheduled')
                .map(log => log.args.queryIDScheduled);

              if (queryEventIds.length === 0) {
                dispatch({
                  type: `${type}_REJECTED`,
                  payload: 'Could not find `QueryScheduled` event.'
                });
                return reject({
                  message: 'Could not find `QueryScheduled` event.'
                });
              }

              const queryID = queryEventIds[0];

              // Listen for query completed
              queryTestContractInstance
                .QueryCompleted()
                .watch(function(error, result) {
                  if (result.args.queryIDCompleted === queryID) {
                    console.log(
                      'attempting to retrieve results for ' + queryID
                    );
                    queryTestContractInstance.getQueryResults
                      .call(queryID)
                      .then(function(queryResults) {
                        dispatch({
                          type: `${type}_FULFILLED`,
                          payload: queryResults
                        });
                        resolve(queryResults);
                      })
                      .catch(err => {
                        dispatch({
                          type: `${type}_REJECTED`,
                          payload: getMetamaskError(err.message.split('\n')[0])
                        });
                        reject(getMetamaskError(err.message.split('\n')[0]));
                      });
                  }
                });
            })
            .catch(err => {
              // catch errors during query submission
              console.error(err);
              dispatch({
                type: `${type}_REJECTED`,
                payload: getMetamaskError(err.message.split('\n')[0])
              });
              return reject(getMetamaskError(err.message.split('\n')[0]));
            });
        });
      } else {
        dispatch({ type: `${type}_REJECTED`, payload: 'Web3 not initialised' });
        reject('Web3 not initialised');
      }
    });
  };
}
