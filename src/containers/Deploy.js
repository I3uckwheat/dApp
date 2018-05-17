import { connect } from 'react-redux';

import Contracts from '../Contracts.js';
import withGAPageView from './GoogleAnalyticsTracker';
import DeployContractForm from '../components/DeployContract/DeployContractForm';

import CreateInitializer, {
  contractConstructor
} from '../util/web3/contractInitializer';
import { deployContract } from '../actions/deploy';
import store from '../store';

const mapStateToProps = state => {
  const { loading, error, contract } = state.deploy;
  const { network } = state.web3;

  return {
    loading,
    error,
    contract,
    network
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeployContract: contractSpecs => {
      const web3 = store.getState().web3.web3Instance;
      const network = store.getState().web3.network;
      const initializeContracts = CreateInitializer(
        contractConstructor.bind(null, web3)
      );

      dispatch(
        deployContract(
          {
            web3,
            contractSpecs,
            network
          },
          initializeContracts(Contracts)
        )
      );
    }
  };
};

const Deploy = withGAPageView(
  connect(mapStateToProps, mapDispatchToProps)(DeployContractForm)
);

export default Deploy;
