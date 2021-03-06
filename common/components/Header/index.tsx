import {
  TChangeGasPrice,
  TChangeLanguage,
  TChangeNodeIntent,
  TAddCustomNode,
  TRemoveCustomNode
} from 'actions/config';
import logo from 'assets/images/logo-myetherwallet.svg';
import { Dropdown, ColorDropdown } from 'components/ui';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import {
  ANNOUNCEMENT_MESSAGE,
  ANNOUNCEMENT_TYPE,
  languages,
  NETWORKS,
  NODES,
  VERSION,
  NodeConfig,
  CustomNodeConfig
} from '../../config/data';
import GasPriceDropdown from './components/GasPriceDropdown';
import Navigation from './components/Navigation';
import CustomNodeModal from './components/CustomNodeModal';
import { getKeyByValue } from 'utils/helpers';
import { makeCustomNodeId } from 'utils/node';
import './index.scss';

interface Props {
  languageSelection: string;
  node: NodeConfig;
  nodeSelection: string;
  isChangingNode: boolean;
  gasPriceGwei: number;
  customNodes: CustomNodeConfig[];

  changeLanguage: TChangeLanguage;
  changeNodeIntent: TChangeNodeIntent;
  changeGasPrice: TChangeGasPrice;
  addCustomNode: TAddCustomNode;
  removeCustomNode: TRemoveCustomNode;
}

interface State {
  isAddingCustomNode: boolean;
}

export default class Header extends Component<Props, State> {
  public state = {
    isAddingCustomNode: false
  };

  public render() {
    const {
      languageSelection,
      changeNodeIntent,
      node,
      nodeSelection,
      isChangingNode,
      customNodes
    } = this.props;
    const { isAddingCustomNode } = this.state;
    const selectedLanguage = languageSelection;
    const selectedNetwork = NETWORKS[node.network];
    const LanguageDropDown = Dropdown as new () => Dropdown<
      typeof selectedLanguage
    >;

    const nodeOptions = Object.keys(NODES)
      .map(key => {
        return {
          value: key,
          name: (
            <span>
              {NODES[key].network} <small>({NODES[key].service})</small>
            </span>
          ),
          color: NETWORKS[NODES[key].network].color,
          hidden: NODES[key].hidden
        };
      })
      .concat(
        customNodes.map(customNode => {
          return {
            value: makeCustomNodeId(customNode),
            name: (
              <span>
                {customNode.network} - {customNode.name} <small>(custom)</small>
              </span>
            ),
            color: '#000',
            hidden: false,
            onRemove: () => this.props.removeCustomNode(customNode)
          };
        })
      );

    return (
      <div className="Header">
        {ANNOUNCEMENT_MESSAGE && (
          <div
            className={`Header-announcement is-${ANNOUNCEMENT_TYPE}`}
            dangerouslySetInnerHTML={{
              __html: ANNOUNCEMENT_MESSAGE
            }}
          />
        )}

        <section className="Header-branding">
          <section className="Header-branding-inner container">
            <Link
              to="/"
              className="Header-branding-title"
              aria-label="Go to homepage"
            >
              {/* TODO - don't hardcode image path*/}
              <img
                className="Header-branding-title-logo"
                src={logo}
                height="64px"
                width="245px"
                alt="MyEtherWallet"
              />
            </Link>
            <div className="Header-branding-right">
              <span className="Header-branding-right-version">v{VERSION}</span>

              <div className="Header-branding-right-dropdown">
                <GasPriceDropdown
                  value={this.props.gasPriceGwei}
                  onChange={this.props.changeGasPrice}
                />
              </div>

              <div className="Header-branding-right-dropdown">
                <LanguageDropDown
                  ariaLabel={`change language. current language ${
                    languages[selectedLanguage]
                  }`}
                  options={Object.values(languages)}
                  value={languages[selectedLanguage]}
                  extra={
                    <li key="disclaimer">
                      <a data-toggle="modal" data-target="#disclaimerModal">
                        Disclaimer
                      </a>
                    </li>
                  }
                  onChange={this.changeLanguage}
                  size="smr"
                  color="white"
                />
              </div>

              <div
                className={classnames({
                  'Header-branding-right-dropdown': true,
                  'is-flashing': isChangingNode
                })}
              >
                <ColorDropdown
                  ariaLabel={`
                    change node. current node ${node.network}
                    node by ${node.service}
                  `}
                  options={nodeOptions}
                  value={nodeSelection}
                  extra={
                    <li>
                      <a onClick={this.openCustomNodeModal}>Add Custom Node</a>
                    </li>
                  }
                  disabled={nodeSelection === 'web3'}
                  onChange={changeNodeIntent}
                  size="smr"
                  color="white"
                  menuAlign="right"
                />
              </div>
            </div>
          </section>
        </section>

        <Navigation color={selectedNetwork.color} />

        {isAddingCustomNode && (
          <CustomNodeModal
            handleAddCustomNode={this.addCustomNode}
            handleClose={this.closeCustomNodeModal}
          />
        )}
      </div>
    );
  }

  public changeLanguage = (value: string) => {
    const key = getKeyByValue(languages, value);
    if (key) {
      this.props.changeLanguage(key);
    }
  };

  private openCustomNodeModal = () => {
    this.setState({ isAddingCustomNode: true });
  };

  private closeCustomNodeModal = () => {
    this.setState({ isAddingCustomNode: false });
  };

  private addCustomNode = (node: CustomNodeConfig) => {
    this.setState({ isAddingCustomNode: false });
    this.props.addCustomNode(node);
  };
}
