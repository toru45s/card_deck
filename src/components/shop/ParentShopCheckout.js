import React, { Component } from 'react';
import { MainContext } from "../../Context";
import '../css/Shop.css';
import ShopDecks from './ShopDecks';
import { withTranslation } from 'react-multi-lang';
import {toast} from "react-toastify";
const axios = require('axios');

class ParentShopCheckout extends Component {

    static contextType = MainContext;

    constructor(props){
        super(props);

        this.state = {scroll: null, eula: true, shopComment: false, isChecked: false ,checkboxCheck: false};

        this.closeWindow = this.closeWindow.bind(this);
        this.showShopDeck = this.showShopDeck.bind(this);
        this.infoWindow = this.infoWindow.bind(this);
        this.setEULA = this.setEULA.bind(this);
        this.updateShopComment = this.updateShopComment.bind(this);
        this.sendAnalyticsEvent = this.sendAnalyticsEvent.bind(this);
    }

    handleCheckboxChange = () => {
        const isChecked = !this.state.isChecked;
        this.setState({ isChecked });
      };

    componentDidMount() {
        const isChecked = localStorage.getItem('isChecked')
        localStorage.setItem('flag', "true");
        this.setState({isChecked });
        // console.log("checkedValue",isChecked)
        const accountWindow = document.getElementById('shop_window');
        accountWindow.addEventListener('showShopDeck', this.showShopDeck);
        this.setState({eula: this.context.user.eula});
    }

    showShopDeck(event) {
        this.setState({scroll: event.detail.deck._id});
    }

    closeWindow() {
        // if (!this.state.shopComment) this.sendAnalyticsEvent("Didn\'t buy");
        this.props.closeShopWindow();
    }

    infoWindow() {
        const { t } = this.props;
        this.props.showModal(t('gameplay.payment_info'));
    }

    updateShopComment(shopComment) {
        this.setState({shopComment});
    }

    sendAnalyticsEvent(comment = false) {
        axios.post('https://events.sendpulse.com/events/id/9b86fcacf3b14859fd3ca68c00b13988/7504019', {
            "email": this.context.user.email,
            "phone": "+123456789",
            "language": this.context.user.language,
            "name": this.context.user.username,
            "system_comment": comment || "No comment"
        });
    }

    async setEULA(e) {
        // localStorage.removeItem('isChecked');
        //  localStorage.setItem('flag', "true");
        // if(e.target.checked){
        //     this.setState({NewisChecked: true})
        // }
        // if(this.state.eula){
        //     localStorage.removeItem('isChecked');
        // }
        const { t } = this.props;
        const newEULA = !this.state.eula;
        this.setState(state => ({
            ...state,
            eula: newEULA
        }));
        // this.setState({checkboxCheck: !this.state.isChecked});
        try {
            const bodyData = {
                eula: newEULA
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/updateUser", {
                method: 'post',
                headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token},
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            this.context.methods.setUser(json);
            // toast.success(t('notifications.account_user_updated'));
        } catch (err) {
            console.log(err);
            toast.error(t('errors.gameplay.account_user_update'));
        }
    }
    render() {
        const { isChecked } = this.state;
        const { t } = this.props;
        const state = (this.props.windowState) ? 'active' : 'inactive';
        const classes = 'shop_wrapper ' + state;
  return (
    <>
        <h1>{t('gameplay.purchase')}</h1>
                    <div id="shop_content" style={{border:"0px solid red"}}>
                        <ShopDecks
                            scroll={this.state.scroll}
                            discardScroll={() => this.setState({scroll: null})}
                            tabChanged={ this.tabChanged }
                            sendAnalyticsEvent={this.sendAnalyticsEvent}
                            updateShopComment={this.updateShopComment}
                            deckSelectedHandler={this.props.deckSelectedHandler}
                        />
                    </div>
                    <div id="shop_close" style={{border:"0px solid red"}} onClick={this.closeWindow}  />
                    <div className="modal_bottom_buttons"  >
                        <div className="infoButton"  onClick={this.infoWindow}>{t('gameplay.account_buy_info')}</div>
                        <div className="closeButton"   onClick={this.closeWindow}>{t('gameplay.close')}</div>
                        <label htmlFor="eula" className="eulaCheckbox" >
                            
                            <input
                                name="eula"
                                type="checkbox"
                                checked={this.state.eula}
                                onChange={this.setEULA}
                                />
                             {t('gameplay.i_agree')} <a href="/eula.html" target="_blank">{t('gameplay.eula')}</a>
                        </label>
                    </div>
    </>
  )}

}

export default withTranslation(ParentShopCheckout);