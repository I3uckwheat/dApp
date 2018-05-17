import qs from 'query-string';
import React, { Component } from 'react';

import showMessage from '../message';
import GuidedDeployment from './GuidedDeployment';
import QuickDeployment from './QuickDeployment';

class DeployContractForm extends Component {
  handleDeploy = values => {
    this.props.onDeployContract(values);
  };

  getQuickDeploymentComponent(props) {
    return (
      <QuickDeployment
        {...props}
        {...this.props}
        showErrorMessage={showMessage.bind(showMessage, 'error')}
        showSuccessMessage={showMessage.bind(showMessage, 'success')}
        onDeployContract={this.handleDeploy}
      />
    );
  }

  getGuidedDeploymentComponent(props) {
    return (
      <GuidedDeployment
        {...props}
        {...this.props}
        onDeployContract={this.handleDeploy}
      />
    );
  }

  computeChildrenProps() {
    const { location, network } = this.props;
    const queryParams = qs.parse(location.search);

    const {
      mode = 'quick' // defaults to QuickDeployment
    } = queryParams;

    // for linking to quick/guided mode inside children components
    // the url is added to make it more accessible to copy links to clipboard
    const guidedModeUrl = `${location.pathname}?${qs.stringify({
      ...queryParams,
      mode: 'guided'
    })}`;

    const switchMode = newMode => {
      this.props.history.push({
        ...location,
        search: `?${qs.stringify({ ...queryParams, mode: newMode })}`
      });
    };

    return {
      mode,
      switchMode,
      guidedModeUrl,
      initialValues: queryParams,
      network
    };
  }

  render() {
    const props = this.computeChildrenProps();
    const mode = props.mode;

    return mode === 'guided'
      ? this.getGuidedDeploymentComponent(props)
      : mode === 'quick'
        ? this.getQuickDeploymentComponent(props)
        : this.getQuickDeploymentComponent(props);
  }
}

export default DeployContractForm;
