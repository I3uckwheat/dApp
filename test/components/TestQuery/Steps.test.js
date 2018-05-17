import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Select, Input, InputNumber } from 'antd';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';

import DataSources from '../../../src/components/TestQuery/OracleDataSources';
import Loader from '../../../src/components/Loader';
import GasPriceField from '../../../src/components/GasPriceField';
import {
  AboutOraclesStep,
  QueryResultStep,
  SelectDataSourceStep,
  SetQueryStep
} from '../../../src/components/TestQuery/Steps';

const Option = Select.Option;

describe('AboutOraclesStep', () => {
  let aboutOracleStep;
  let onNextClickSpy;
  beforeEach(() => {
    onNextClickSpy = sinon.spy();
    aboutOracleStep = shallow(<AboutOraclesStep onNextClicked={onNextClickSpy}/>);

  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<AboutOraclesStep />, div);
  });

  it('should display information about Oracles', () => {
    // humm...
  });

  it('sets correct onNextClicked property', () => {
    expect(aboutOracleStep.find(Button).props().onClick).to.equal(onNextClickSpy);
  });
});

describe('SelectDataSourceStep', () => {
  let selectDataSourceStep;
  let onNextClickSpy;
  let onPrevClickSpy;
  let onChangeSpy;

  beforeEach(() => {
    onNextClickSpy = sinon.spy();
    onPrevClickSpy = sinon.spy();
    onChangeSpy = sinon.spy();
    selectDataSourceStep = shallow(<SelectDataSourceStep
      onNextClicked={onNextClickSpy}
      onPrevClicked={onPrevClickSpy}
      onChange={onChangeSpy} />);
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SelectDataSourceStep />, div);
  });

  it('renders all data sources as Option', () => {
      const sourceOptions = DataSources.map(({ name }) => <Option key={name} value={name}>{name}</Option>);
      expect(selectDataSourceStep.containsAllMatchingElements(sourceOptions)).to.equal(true);
  });

  it('sets correct onNextClicked property', () => {
    selectDataSourceStep.find(Button).last().simulate('click');
    expect(onNextClickSpy).to.have.property('callCount', 1);
  });

  it('sets correct onPrevClicked property', () => {
    selectDataSourceStep.find(Button).first().simulate('click');
    expect(onPrevClickSpy).to.have.property('callCount', 1);
  });

  it('should trigger onChange when data source changes', () => {
    selectDataSourceStep.find(Select).simulate('change', 'URL');
    expect(onChangeSpy).to.have.property('callCount', 1);
  });
});

describe('SetQueryStep', () => {
  let setQueryStep;
  let onSubmitSpy;
  let onPrevClickSpy;
  let onChangeSpy;
  let updateGasLimitSpy;
  let updateGasPriceSpy;
  beforeEach(() => {
    onSubmitSpy = sinon.spy();
    onPrevClickSpy = sinon.spy();
    onChangeSpy = sinon.spy();
    updateGasLimitSpy = sinon.spy();
    updateGasPriceSpy = sinon.spy();
    setQueryStep = shallow(<SetQueryStep
      dataSource={DataSources[0].name}
      onSubmit={onSubmitSpy}
      onPrevClicked={onPrevClickSpy}
      onUpdateGasLimit={updateGasLimitSpy}
      onUpdateGasPrice={updateGasPriceSpy}
      onChange={onChangeSpy} />);
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SetQueryStep dataSource={DataSources[0].name} />, div);
  });

  it('should update query state with changes in query input', () => {
    const queryInput = '2+2';
    setQueryStep.find(Input).simulate('change', { target: { value: queryInput } });
    expect(setQueryStep.state('query')).to.equal(queryInput);
    expect(onChangeSpy).to.have.property('callCount', 1);
  });

  it('should call updateGasLimit with changes in gas limit input', () => {
    const gas = 580000;
    setQueryStep.find(GasPriceField).simulate('updateGasLimit', gas);
    expect(updateGasLimitSpy).to.have.property('callCount', 1);
  });

  it('should call updateGasPrice with changes in gas price input', () => {
    const price = 3;
    setQueryStep.find(GasPriceField).simulate('updateGasPrice', price);
    expect(updateGasPriceSpy).to.have.property('callCount', 1);
  });

  it('sets correct onPrevClicked property', () => {
    setQueryStep.find(Button).first().simulate('click');
    expect(onPrevClickSpy).to.have.property('callCount', 1);
  });

  it('should submit with valid query', () => {
    // this test assumes that datasource would not change
    // ideal scenario should mock the getDataSourceObj() function.
    setQueryStep.setProps({ dataSource: 'WolframAlpha' });
    // a valid query
    setQueryStep.setState({ query: '2+2' });

    setQueryStep.find(Button).last().simulate('click');
    expect(onSubmitSpy).to.have.property('callCount', 1);
  });

  it('should show error with invalid query', () => {
    // this test assumes that datasource would not change
    // ideal scenario should mock the getDataSourceObj() function.
    setQueryStep.setProps({ dataSource: 'WolframAlpha' });
    // an invalid query
    setQueryStep.setState({ query: '' });

    setQueryStep.find(Button).last().simulate('click');
    expect(setQueryStep.state('error')).to.not.be.a('null');
  });
});

describe('QueryResultStep', () => {
  let queryResultStep;

  beforeEach(() => {
    queryResultStep = shallow(<QueryResultStep />);
  });

  it('should show loading correctly', () => {
    queryResultStep.setProps({ loading: true });
    expect(queryResultStep.find(Loader).props().loading).to.equal(true);
  });

  it('should hide loading correctly', () => {
    queryResultStep.setProps({ loading: false });
    expect(queryResultStep.find(Loader).length).to.equals(0);
  });

  it('should display results when not loading', () => {
    const expectedResult = 'something nice';
    queryResultStep.setProps({ loading: false, error: null, result: expectedResult });
    expect(queryResultStep.find('.result').text()).to.equal(expectedResult);
  });

  it('should not display results when loading', () => {
    const expectedResult = 'something nice';
    queryResultStep.setProps({ loading: true, result: expectedResult });
    expect(queryResultStep.find('.result')).to.have.length(0);
  });
});
