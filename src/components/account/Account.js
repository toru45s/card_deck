import React, { Component } from 'react';
import { MainContext } from "../../Context";
import { Tabs, Tab } from '@material-ui/core';
import '../css/Account.css';
import AccountPersonal from './AccountPersonal';
import AccountDecks from './AccountDecks';
import { withTranslation } from 'react-multi-lang';
import {toast} from "react-toastify";
import Cookies from "js-cookie";

class Account extends Component {

    static contextType = MainContext;

    constructor(props){
        super(props);

        this.state = {active_tab: "1", scroll: null};

        this.closeWindow = this.closeWindow.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.showAccountDeck = this.showAccountDeck.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    componentDidMount() {
        const accountWindow = document.getElementById('account_window');
        accountWindow.addEventListener('showAccountDeck', this.showAccountDeck);
    }

    showAccountDeck(event) {
        this.tabChanged('showAccountDeck', "2");
        this.setState({scroll: event.detail.deck._id});
    }

    closeWindow() {
        this.props.closeAccountWindow();
    }

    tabChanged(event, newValue) {
        this.setState({active_tab: newValue});
    }

    logOut(){
        const { t } = this.props;
        toast(t('notifications.logged_out'));
        Cookies.remove("token");
        this.props.socket.emit('logout', {userId: this.context.user.id});
        this.context.methods.resetUser();
        this.props.socket.close();
    }

    render() {
        const { t } = this.props;
        const state = (this.props.windowState) ? 'active' : 'inactive';
        const classes = 'account_wrapper ' + state;

        return (
            <div className={classes} id="account">
                <div id="account_window">
                    <div id="account_content">
                        {!this.context.user.guest &&
                        <div id="account_navigation">
                            <Tabs
                                orientation="horizontal"
                                variant="scrollable"
                                value={this.state.active_tab}
                                onChange={this.tabChanged}
                            >
                                <Tab label={t('gameplay.account')} className="account_tab" value="1"/>
                                <Tab label={t('gameplay.my_subscriptions')} className="account_tab" value="2"/>
                            </Tabs>
                        </div>
                        }
                        <div className="account_active_tab">
                            {this.state.active_tab === "1" &&
                            <AccountPersonal logout={this.logOut} openShop={this.props.openShop} closeAccount={this.closeWindow} syncBackgrounds={this.props.syncBackgrounds} />
                            }
                            {this.state.active_tab === "2" &&
                            <AccountDecks scroll={this.state.scroll} discardScroll={() => this.setState({scroll: null})} tabChanged={ this.tabChanged } />
                            }
                        </div>
                    </div>
                    <div id="account_close" onClick={this.closeWindow} />
                    <div className="modal_bottom_buttons">
                        <div className="closeButton" onClick={this.closeWindow}>{t('gameplay.close')}</div>
                    </div>
                </div>
            </div>
        );
    }

}

export default withTranslation(Account);
