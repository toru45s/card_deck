import React, { Component } from 'react';
import {toast} from "react-toastify";
import {MainContext} from "../../Context";
import { withTranslation } from 'react-multi-lang';
import {subscribeMonthCheckout} from './CardCheckout';
import DeckSelector from '../DeckSelector';

class ShopDeckSelector extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.state = { processing: false,ispopup:false, error: "", ispopupUnsubscribed:false, };

        this.render = this.render.bind(this);
        this.subscribeMonth = this.subscribeMonth.bind(this);
        this.subscribeYear = this.subscribeYear.bind(this);
        this.subscribePaypal = this.subscribePaypal.bind(this);
        this.unsubscribePaypal = this.unsubscribePaypal.bind(this);
    }

     
    async subscribeMonth() {
        localStorage.setItem("Sure_poup","true");
        const { t } = this.props;
        this.props.updateShopComment('Initiated monthly subscription transaction');
        if (!this.context.user.eula) {
            if (!this.state.ispopup) {
                toast.dismiss(); // remove any existing toast message
                toast.error(t('notifications.eula_required')); //Monthly toast
                this.setState({ispopup: true});
                setTimeout(() => {
                  this.setState({ispopup: false});
                }, 5000);
              }
            // localStorage.setItem("isChecked","true");

            return false;
        }

        await this.subscribePaypal('MONTH', this.props.price);
    }

    async subscribeYear() {
        localStorage.setItem("Sure_poup","true");
        const { t } = this.props;
        this.props.updateShopComment('Initiated yearly subscription transaction');
        if (!this.context.user.eula) {
            if (!this.state.ispopup) {
                toast.dismiss(); // remove any existing toast message
                toast.error(t('notifications.eula_required')); //Yearly toast 
                this.setState({ispopup: true});
                setTimeout(() => {
                  this.setState({ispopup: false});
                }, 5000);
              }
            // localStorage.setItem("isChecked","true");
            return false;
        }

        await this.subscribePaypal('YEAR', this.props.price_year);
    }

    async getPaypalToken() {
        // GET PAYPAL BEARER TOKEN
        const tokenData = new URLSearchParams();
        tokenData.append('grant_type', 'client_credentials');
        const token = await fetch("https://api.paypal.com/v1/oauth2/token", {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(process.env.REACT_APP_PAYPAL_CLIENT_ID + ":" + process.env.REACT_APP_PAYPAL_SECRET)
            },
            body: tokenData
        });
        if (!token.ok) {
            throw Error(token.statusText);
        }
        const tokenJSON = await token.json();

        return tokenJSON.access_token;
    }

    async getGeoInfo() {
        try {
            const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=79bf5db729e548feb582624d4e134756');
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const responseJSON = await response.json();
            if (responseJSON.country_name) {
                return responseJSON.country_name;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async subscribePaypal(interval, price) {
        const { t } = this.props;
        // toast(t('notifications.opening_paypal'), {pauseOnFocusLoss: false});
        this.setState({ processing: true });

        try {
            // const access_token = await this.getPaypalToken();
            // const country = await this.getGeoInfo();
            // CREATE PAYPAL PRODUCT
            // const productData = {
            //     name: this.props.name,
            //     description: "Digital Card Deck",
            //     type: "DIGITAL",
            //     category: "GAMES",
            // };
            let new_obj={
                ...this.props,
                selected_plan:interval
            }
            localStorage.setItem("productData", JSON.stringify(new_obj));
            // window.location.href = '/cart-checkout';
            this.props.deckSelectedHandler();
            // const product = await fetch("https://api.paypal.com/v1/catalogs/products", {
            //     method: 'post',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": "Bearer " + access_token
            //     },
            //     body: JSON.stringify(productData)
            // });
            // if (!product.ok) {
            //     throw Error(product.statusText);
            // }
            // const productJSON = await product.json();

            // // CREATE PAYPAL PLAN
            // const planData = {
            //     product_id: productJSON.id,
            //     name: productJSON.name,
            //     description: "Digital Card Deck subscription",
            //     status: "ACTIVE",
            //     billing_cycles: [
            //         {
            //             frequency: {
            //                 interval_unit: interval,
            //                 interval_count: 1
            //             },
            //             tenure_type: "REGULAR",
            //             pricing_scheme: {
            //                 fixed_price: {
            //                     value: price.toFixed(2),
            //                     currency_code: "USD"
            //                 }
            //             },
            //             sequence: 1,
            //             total_cycles: 0
            //         }
            //     ],
            //     payment_preferences: {
            //         setup_fee: {
            //             currency_code: "USD",
            //             value: "0.00"
            //         },
            //         setup_fee_failure_action: "CONTINUE",
            //         payment_failure_threshold: 3
            //     }
            // };
            // if (country === 'Israel') {
            //     planData.taxes = {
            //         inclusive: false,
            //         percentage: "17.00"
            //     };
            // }
            //             // console.log(planData,productJSON)

            // const plan = await fetch("https://api.paypal.com/v1/billing/plans", {
            //     method: 'post',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": "Bearer " + access_token
            //     },
            //     body: JSON.stringify(planData)
            // });
            // if (!plan.ok) {
            //     throw Error(plan.statusText);
            // }
            // const planJSON = await plan.json();

            // // CREATE PAYPAL SUBSCRIPTION
            // const subscriptionData = {
            //     plan_id: planJSON.id
            // };
            // const subscription = await fetch("https://api.paypal.com/v1/billing/subscriptions", {
            //     method: 'post',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": "Bearer " + access_token
            //     },
            //     body: JSON.stringify(subscriptionData)
            // });
            // if (!subscription.ok) {
            //     throw Error(subscription.statusText);
            // }
            // const subscriptionJSON = await subscription.json();
            // console.log("subscriptionJSON", subscriptionJSON)

            // // INITIATE A TRANSACTION ON OUR SIDE
            // const transactionData = {
            //     product_id: this.props.id,
            //     plan_id: planJSON.id,
            //     subscription_id: subscriptionJSON.id,
            //     interval: interval,
            //     price: price
            // };

            // const transaction = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/startTransaction", {
            //     method: 'post',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "x-access-token": this.context.user.token
            //     },
            //     body: JSON.stringify(transactionData)
            // });
            // if (!transaction.ok) {
            //     throw Error(transaction.statusText);
            // }

            // const paypalWindow = window.open(subscriptionJSON.links[0].href, "_blank");
            // this.setState({ processing: false });

            // let i = 1;
            // const isPaypalClosedInterval = setInterval(async () => {
            //     if(paypalWindow.closed) {
            //         clearInterval(isPaypalClosedInterval);
            //         if (i === 1) {
            //             this.props.sendAnalyticsEvent('Closed immediately');
            //             if (typeof window.tidioChatApi !== "undefined") {
            //                 window.tidioChatApi.open();
            //                 window.tidioChatApi.messageFromOperator("I saw that you were looking at the purchase options, may I help?");
            //             }
            //             return false;
            //         } else if (i >= 100) return false;
            //         const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getLatestUserTransaction", {
            //             headers: {
            //                 "x-access-token": this.context.user.token
            //             }
            //         });
            //         if (response.ok) {
            //             const json = await response.json();
            //             if (json.status === 0) {
            //                 this.props.sendAnalyticsEvent('Cancelled subscription transaction');
            //                 if (typeof window.tidioChatApi !== "undefined") {
            //                     window.tidioChatApi.open();
            //                     window.tidioChatApi.messageFromOperator("I saw that you were looking at the purchase options, may I help?");
            //                 }
            //             }
            //         }
            //     }
            //     i++;
            // }, 3000);
        } catch (err) {
            console.log(err);
            this.setState({ processing: false });
        }
    }

    async unsubscribePaypal() {
        try {

        const { t } = this.props;
        const access_token = await this.getPaypalToken();
        const subscriptionData = {
            reason: 'Personal decision'
        };
        const subscription = await fetch("https://api.paypal.com/v1/billing/subscriptions/" + this.props.subscribed + "/cancel", {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            },
            body: JSON.stringify(subscriptionData)
        });
        
        if (!subscription.ok) {
            throw new Error('Request failed with status ' + subscription.status);
        }

        toast.success(t('notifications.unsubscribed'));
    } catch (err) {
        const { t } = this.props;
        console.log(err);
        if(!this.state.error){
        this.setState({error: "Oops, something went wrong. try again later."});
        toast.dismiss()
        toast.error(t(this.state.error));
        this.setState({ispopupUnsubscribed: true});
        setTimeout(() => {
            this.setState({ispopupUnsubscribed: false});
        }, 5000);
    }
    }
    
}
    render() {
        const { t } = this.props;
        const optionsClassList = (this.state.processing) ? "subscribeDeck_options processing" : "subscribeDeck_options";

        return (
            <div className="shop_deck-selector" data-id={this.props.id}>
                <div className="deckImageWrapper">
                    <img src={this.props.image} alt={this.props.name} className="pseudoDeck"/>
                    <img src={this.props.image} alt={this.props.name} className="pseudoDeck"/>
                    <img src={this.props.image} alt={this.props.name} />
                </div>
                <div className="deck_name">{this.props.name}</div>
                {(this.props.price > 0 || this.props.price_year > 0) &&
                    <>
                        {this.props.subscribed === "false" &&
                        <div className={optionsClassList}>
                            <div className="subscribe_text">{t('gameplay.subscribe')}</div>
                            <div className="subscribe_month">
                                <div className="subscribeDeck month" onClick={()=>{this.subscribeMonth();}}>
                                    <span className="subscribeDeck_price">${this.props.price}</span><span className="subscribeDeck_buy" style={{border:'0px solid red'}}>{t('gameplay.monthly')}</span>
                                </div>
                            </div>
                            <div className="subscribe_year">
                                <div className="subscribeDeck year" onClick={()=>{this.subscribeYear()}}>
                                    <span className="subscribeDeck_price">${this.props.price_year}</span><span className="subscribeDeck_buy" style={{border:'0px solid red'}}>{t('gameplay.yearly')}</span>
                                </div>
                            </div>
                        </div> 
                        }
                        {this.props.subscribed !== "false" &&
                        <div className={optionsClassList}>
                            <div className="unsubscribeDeck" onClick={this.unsubscribePaypal}>{t('gameplay.unsubscribe')}</div>
                        </div>
                        }
                    </>
                }
            </div>
        );
    }

}

export default withTranslation(ShopDeckSelector);
