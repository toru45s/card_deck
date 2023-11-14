import React, { Component } from 'react';
import {toast} from "react-toastify";
import {MainContext} from "../../Context";
import { withTranslation } from 'react-multi-lang';
import ConfirmPrompt from "../ConfirmPrompt";

class AccountDeckSelector extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.state = { processing: false, confirmOpen: false };

        this.render = this.render.bind(this);
        this.subscribeMonth = this.subscribeMonth.bind(this);
        this.subscribeYear = this.subscribeYear.bind(this);
        this.subscribePaypal = this.subscribePaypal.bind(this);
        this.unsubscribePaypal = this.unsubscribePaypal.bind(this);
    }


    async subscribeMonth() {
        const { t } = this.props;
        if (!this.context.user.eula) {
            this.props.tabChanged(null, "1");
            toast.error(t('notifications.eula_required'));
            return false;
        }

        await this.subscribePaypal('MONTH', this.props.price);
    }

    async subscribeYear() {
        const { t } = this.props;
        if (!this.context.user.eula) {
            this.props.tabChanged(null, "1");
            toast.error(t('notifications.eula_required'));
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
        toast(t('notifications.opening_paypal'), {pauseOnFocusLoss: false});
        this.setState({ processing: true });

        try {
            const access_token = await this.getPaypalToken();
            const country = await this.getGeoInfo();
            // CREATE PAYPAL PRODUCT
            const productData = {
                name: this.props.name,
                description: "Digital Card Deck",
                type: "DIGITAL",
                category: "GAMES",
            };
            const product = await fetch("https://api.paypal.com/v1/catalogs/products", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(productData)
            });
            if (!product.ok) {
                throw Error(product.statusText);
            }
            const productJSON = await product.json();

            // CREATE PAYPAL PLAN
            const planData = {
                product_id: productJSON.id,
                name: productJSON.name,
                description: "Digital Card Deck subscription",
                status: "ACTIVE",
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: interval,
                            interval_count: 1
                        },
                        tenure_type: "REGULAR",
                        pricing_scheme: {
                            fixed_price: {
                                value: price.toFixed(2),
                                currency_code: "USD"
                            }
                        },
                        sequence: 1,
                        total_cycles: 0
                    }
                ],
                payment_preferences: {
                    setup_fee: {
                        currency_code: "USD",
                        value: "0.00"
                    },
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                }
            };
            if (country === 'Israel') {
                planData.taxes = {
                    inclusive: false,
                    percentage: "17.00"
                };
            }
            const plan = await fetch("https://api.paypal.com/v1/billing/plans", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(planData)
            });
            if (!plan.ok) {
                throw Error(plan.statusText);
            }
            const planJSON = await plan.json();

            // CREATE PAYPAL SUBSCRIPTION
            const subscriptionData = {
                plan_id: planJSON.id
            };
            const subscription = await fetch("https://api.paypal.com/v1/billing/subscriptions", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(subscriptionData)
            });
            if (!subscription.ok) {
                throw Error(subscription.statusText);
            }
            const subscriptionJSON = await subscription.json();

            // INITIATE A TRANSACTION ON OUR SIDE
            const transactionData = {
                product_id: this.props.id,
                plan_id: planJSON.id,
                subscription_id: subscriptionJSON.id,
                interval: interval,
                price: price
            };

            const transaction = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/startTransaction", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": this.context.user.token
                },
                body: JSON.stringify(transactionData)
            });
            if (!transaction.ok) {
                throw Error(transaction.statusText);
            }

            window.open(subscriptionJSON.links[0].href, "_blank");
            this.setState({ processing: false });
        } catch (err) {
            console.log(err);
            this.setState({ processing: false });
        }
    }

    async unsubscribePaypal() {
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
            throw Error(subscription.statusText);
        }

        toast.success(t('notifications.unsubscribed'));
    }

    render() {
        const { t } = this.props;
        const optionsClassList = (this.state.processing) ? "subscribeDeck_options processing" : "subscribeDeck_options";

        return (
            <li className="account_deck-selector" data-id={this.props.id}>
                <ConfirmPrompt open={this.state.confirmOpen} title={t('gameplay.remove_confirm')} onClose={() => this.setState({confirmOpen: false})} onConfirm={this.unsubscribePaypal} />
                <div className="subscribeDeck_info">
                    <img src={this.props.image} alt={this.props.name} title={this.props.name} />
                    <span>{this.props.name}</span>
                </div>
                <div className={optionsClassList}>
                    {(this.props.subscribed && this.props.subscribed !== "false") && <div className="unsubscribeDeck" onClick={() => this.setState({confirmOpen: true})}>{t('gameplay.unsubscribe')}</div>}
                    {(!this.props.subscribed || this.props.subscribed === "false") && <div>No Active Subscription</div>}
                </div>
            </li>
        );
    }

}

export default withTranslation(AccountDeckSelector);
