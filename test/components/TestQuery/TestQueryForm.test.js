import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import { Steps } from 'antd';
import { expect } from 'chai';
import sinon from 'sinon';

import TestQueryForm from '../../../src/components/TestQuery/TestQueryForm';
import {
  AboutOraclesStep,
  QueryResultStep,
  SelectDataSourceStep,
  SetQueryStep
} from '../../../src/components/TestQuery/Steps';

const aboutStep = 0;
const dataSourceStep = 1;
const setQueryStep = 2;
const queryResultStep = 3;

describe('TestQueryForm', () => {
  let testQueryForm;
  let onTestQuerySpy;
  beforeEach(() => {
    onTestQuerySpy = sinon.spy();
    testQueryForm = shallow(<TestQueryForm onTestQuery={onTestQuerySpy}/>);
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TestQueryForm />, div);
  });

  it('should render 4 steps', () => {
    expect(testQueryForm.find(Steps.Step)).to.have.length(4);
  });

  it('should render AboutOracleStep by default', () => {
    expect(testQueryForm.find(AboutOraclesStep)).to.have.length(1);
  });

  it('should render SelectDataSourceStep as second step', () => {
    testQueryForm.setState({ step: dataSourceStep });
    expect(testQueryForm.find(SelectDataSourceStep)).to.have.length(1);
  });

  it('should move to prev step on SelectDataSourceStep.onPrevClicked', () => {
    testQueryForm.setState({ step: dataSourceStep });
    testQueryForm.find(SelectDataSourceStep).simulate('prevClicked');
    expect(testQueryForm.state('step')).to.equal(dataSourceStep - 1);
  });

  it('should move to next step on SelectDataSourceStep.onNextClicked', () => {
    testQueryForm.setState({ step: dataSourceStep });
    testQueryForm.find(SelectDataSourceStep).simulate('nextClicked');
    expect(testQueryForm.state('step')).to.equal(dataSourceStep + 1);
  });

  it('should change data source with SelectDataSourceStep.onChange', () => {
    const dataSource = 'URL';
    testQueryForm.setState({ step: dataSourceStep });
    testQueryForm.find(SelectDataSourceStep).simulate('change', dataSource);
    expect(testQueryForm.state('oracleDataSource')).to.equal(dataSource);
  });

  it('should change gas price with SetQueryStep.onUpdateGasLimit', () => {
    const gas = 580000;
    testQueryForm.setState({ step: setQueryStep });
    testQueryForm.find(SetQueryStep).simulate('updateGasLimit', gas);
    expect(testQueryForm.state('gas')).to.equal(gas);
  });

  it('should change gas price with SetQueryStep.onUpdateGasPrice', () => {
    const gasPrice = 3;
    testQueryForm.setState({ step: setQueryStep });
    testQueryForm.find(SetQueryStep).simulate('updateGasPrice', gasPrice);
    expect(testQueryForm.state('gasPrice')).to.equal(gasPrice);
  });

  it('should render SetQueryStep as third step', () => {
    testQueryForm.setState({ step: setQueryStep });
    expect(testQueryForm.find(SetQueryStep)).to.have.length(1);
  });

  it('should change query with SetQueryStep.onChange', () => {
    const query = 'https://some-query-url.com';
    testQueryForm.setState({ step: setQueryStep });
    testQueryForm.find(SetQueryStep).simulate('change', query);
    expect(testQueryForm.state('oracleQuery')).to.equal(query);
  });

  it('should call onTestQuery when query is submitted', () => {
    testQueryForm.setState({ step: setQueryStep });
    testQueryForm.find(SetQueryStep).simulate('submit');

    expect(onTestQuerySpy).to.have.property('callCount', 1);
  });

  it('should render QueryResultStep as fourth step', () => {
    testQueryForm.setState({ step: queryResultStep });
    expect(testQueryForm.find(QueryResultStep)).to.have.length(1);
  });

  it('should reset to inital step', () => {
    testQueryForm.setState({ step: queryResultStep});
    testQueryForm.setProps({error: "Without data"});
    testQueryForm.find(QueryResultStep).simulate('failSubmit');
    expect(testQueryForm.state('step')).to.equal(0);

  });

  it('should navigate to /contract/deploy onCreateContractClicked', () => {
    const navSpy = sinon.spy();
    testQueryForm.setState({
      step: queryResultStep,
      oracleDataSource: 'WolframAlpha',
      oracleQuery: '2+2'
    });
    testQueryForm.setProps({
      history: { push: navSpy }
    });
    testQueryForm.find(QueryResultStep).props().onCreateContractClicked();

    expect(navSpy).to.have.property('callCount', 1);
    // TODO: Test to ensure navSpy is called with correct path /contract/deploy
  });
});
