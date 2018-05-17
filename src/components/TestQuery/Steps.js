import { Alert, Button, Card, Col, Form, Icon, Input, Row, Select } from 'antd';
import React, { Component } from 'react';

import Loader from '../Loader';
import '../../less/Step.less';
import OracleDataSources, { getDataSourceObj } from './OracleDataSources';
import GasPriceField from '../GasPriceField';

const FormItem = Form.Item;
const Option = Select.Option;
const ButtonGroup = Button.Group;

// Steps used by the TestQueryForm

/**
 * Component in charge of rendering about Oracles step
 * First Step
 */
class AboutOraclesStep extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col>
            <h1>Testing Oracle Queries</h1>
            <div>
              <h2>What is an Oracle?</h2>
              Blockchain applications natively are unable to interact with
              outside data sources. An oracle is a third party that provides the
              ability to access off chain data from the blockchain ensuring its
              validity using cryptographic proofs.
            </div>
            <br />
            <div>
              <h2>Which Oracle are we using?</h2>
              Our proof of concept has been built using
              <a
                href="http://www.oraclize.it/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                Oraclize.it
              </a>, the leading oracle service for smart contracts and
              blockchain applications, serving thousands of requests every day
              on Ethereum, Bitcoin and Rootstock.
            </div>
            <br />
            <div>
              <h2>How it works</h2>
              Oraclize internally replicates an “If This Then That” logical
              model. This means that it will execute a given set of instructions
              if some other given conditions have been met. A valid request to
              Oraclize should specify both a <b>Data Source</b> and a{' '}
              <b>Query</b>. We will walk you through that process here.
            </div>
            <br />
          </Col>
        </Row>
        <br />
        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" onClick={this.props.onNextClicked}>
              Select a Data Source <Icon type="arrow-right" />
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Component to enlighten about Selecting Oracles
 * Second Step
 *
 */
class SelectDataSourceStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource || OracleDataSources[0].name
    };
  }

  onDataSourceChange(source) {
    this.setState({ dataSource: source });
    this.props.onChange(source);
  }

  render() {
    const source = this.state.dataSource;
    return (
      <div>
        <Row>
          <Col>
            <h1>Select a Data Source</h1>
            <div>
              A data source is a trusted provider of data. It can be a website
              or web API such as Reuters, Weather.com, BBC.com. For many of our
              intended use cases a centralised crypto exchanges API works well.
              Additional options include a secure application running on an
              hardware-enforced Trusted Execution Environment (TEE) or perhaps,
              an audit-able, locked-down virtual machine instance running in a
              cloud provider. The most obviously useful data sources for our
              derivatives contracts are URL and WolframAlpha.
            </div>
            <br />
            <div>
              Below are the data sources you can choose from when using
              <a
                href="http://www.oraclize.it/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                Oraclize.it
              </a>. Select one and proceed to test out a query.
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Select a Data Source">
              <Select
                defaultValue={source}
                size="large"
                onChange={this.onDataSourceChange.bind(this)}
                style={{ width: '100%' }}
              >
                {OracleDataSources.map(({ name }) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>More info on '{source}' data sources</h3>
            {getDataSourceObj(source).descriptionComponent()}
          </Col>
        </Row>
        <br />
        <Row type="flex" justify="end">
          <Col>
            <ButtonGroup>
              <Button type="default" onClick={this.props.onPrevClicked}>
                <Icon type="left" />Back
              </Button>
              <Button type="primary" onClick={this.props.onNextClicked}>
                Enter Query<Icon type="right" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Component to Set Query based on the data source specified.
 * Third Step
 *
 */
class SetQueryStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      error: null
    };
  }

  onInputChange(e) {
    const text = e.target.value;
    this.setState({ query: text, error: null });
    this.props.onChange(text);
  }

  onUpdateGasLimit(gas) {
    this.props.onUpdateGasLimit(gas);
  }

  onUpdateGasPrice(price) {
    this.props.onUpdateGasPrice(price);
  }

  validateAndSubmit() {
    const dataSourceObj = getDataSourceObj(this.props.dataSource);
    if (dataSourceObj.isQueryValid(this.state.query)) {
      this.props.onSubmit();
    } else {
      this.setState({ error: dataSourceObj.queryHint() });
    }
  }

  render() {
    const { dataSource, location, network } = this.props;

    return (
      <div>
        <Row>
          <Col>
            <h1>Enter a Query to test on '{dataSource}' Data Source</h1>
            <div>
              A query is request which needs to be evaluated in order to
              complete a specific data source type request.
            </div>
            <br />
            <div>
              <h2>Some examples of {dataSource} Queries</h2>
              <div className="sample-query-list">
                {getDataSourceObj(dataSource).sampleQueries.map(
                  (sample, idx) => {
                    return (
                      <div className="sample-query-item" key={idx}>
                        {sample.title && (
                          <div className="sample-query-title">
                            {sample.title}:
                          </div>
                        )}
                        <div className="sample-query">{sample.query}</div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <FormItem label="Enter a query to test">
              {this.state.error && (
                <Alert message={this.state.error} type="error" />
              )}
              <Input
                placeholder="Query"
                onChange={this.onInputChange.bind(this)}
              />
            </FormItem>
            <div>
              NOTE: You can specify your
              <a
                href="http://docs.oraclize.it/#general-concepts-parsing-helpers"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                parsing helpers{' '}
              </a>
              with the query too.
            </div>
            <br />
          </Col>
        </Row>
        <GasPriceField
          location={location}
          network={network}
          onUpdateGasLimit={this.onUpdateGasLimit.bind(this)}
          onUpdateGasPrice={this.onUpdateGasPrice.bind(this)}
        />
        <Row type="flex" justify="end">
          <Col>
            <ButtonGroup>
              <Button type="default" onClick={this.props.onPrevClicked}>
                <Icon type="left" />Change Data Source
              </Button>
              <Button
                type="primary"
                onClick={this.validateAndSubmit.bind(this)}
              >
                Submit Query<Icon type="right" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Component to Show the Result of Query after fetching
 * Fourth Step
 *
 */
class QueryResultStep extends Component {
  render() {
    return (
      <div style={{ padding: '30px' }}>
        <Row type="flex" justify="center">
          <Col lg={{ span: 16 }} sm={{ span: 24 }} xs={{ span: 24 }}>
            <Card title="Query Result" style={{ width: '100%' }}>
              {this.props.loading && (
                <div style={{ position: 'relative', height: '100px' }}>
                  <Loader loading={this.props.loading} top={'0'} />
                </div>
              )}
              {!this.props.loading &&
                !this.props.error && (
                  <p className="result">{this.props.result}</p>
                )}
              {!this.props.loading &&
                this.props.error && (
                  <Alert message={`${this.props.error}`} type="error" />
                )}
            </Card>
          </Col>
        </Row>
        <br />
        <Row type="flex" justify="center">
          <Col>
            {!this.props.loading &&
              this.props.error && (
                <Button type="primary" onClick={this.props.onFailSubmit}>
                  Try again
                </Button>
              )}
            {!this.props.loading &&
              !this.props.error && (
                <ButtonGroup>
                  <Button type="default" onClick={this.props.onPrevClicked}>
                    <Icon type="left" />Test another query
                  </Button>
                  <Button
                    type="primary"
                    onClick={this.props.onCreateContractClicked}
                  >
                    Create contract with Query<Icon type="right" />
                  </Button>
                </ButtonGroup>
              )}
          </Col>
        </Row>
      </div>
    );
  }
}

export {
  AboutOraclesStep,
  SelectDataSourceStep,
  SetQueryStep,
  QueryResultStep
};
