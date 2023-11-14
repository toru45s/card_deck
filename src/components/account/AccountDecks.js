import React, { Component } from 'react';
import { MainContext } from "../../Context";
import DeckSelector from "./AccountDeckSelector";
import { withTranslation, getLanguage } from 'react-multi-lang';
import {toast} from "react-toastify";
import ConfirmPrompt from "../ConfirmPrompt";

class AccountDecks extends Component {

    static contextType = MainContext;

    constructor(props){
        super(props);

        this.state = {decks: [], allDecksPrice: 10, confirmOpen: false, fullSubscriptionId: false};
        this.renderDeckSelector = this.renderDeckSelector.bind(this);
        this.subscribeAll = this.subscribeAll.bind(this);
        this.unsubscribeAllPaypal = this.unsubscribeAllPaypal.bind(this);
        this.getSubscriptions = this.getSubscriptions.bind(this);
    }

    componentDidMount() {
        this.getDecks();
        this.getTotalPrice();
        this.getSubscriptions();
    }

    componentDidUpdate() {
        if (this.props.scroll) {
            const target = document.querySelector('.account_deck-selector[data-id="'+ this.props.scroll +'"]');
            if (target) {
                target.scrollIntoView();
                target.classList.add('flash');
            }
            this.props.discardScroll();
        }
    }

    async getSubscriptions() {
        const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getUserTransactions", {
            headers: {
                "x-access-token": this.context.user.token
            }
        });
        if (!response.ok) {
            throw Error(response.statusText);
        }
        const json = await response.json();
        const fullSubscriptionTransaction = json.find(x => x.product_id === "all");
        if (fullSubscriptionTransaction) {
            this.setState({fullSubscriptionId: fullSubscriptionTransaction.subscription_id});
        }
    }

    async getTotalPrice() {
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getTotalDeckPrice", {
                headers: {
                    "x-access-token": this.context.user.token,
                },
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();
            this.setState({allDecksPrice: parseFloat(json.value)});
        } catch (err) {
            console.log(err);
            toast.error(err);
        }
    }

    async getDecks() {
        const { t } = this.props;
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getAllDecks", {
                headers: {
                    "x-access-token": this.context.user.token
                }
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            if (json.length > 0) {
                this.setState({decks: json});
            }
        } catch (err) {
            toast.error(t('errors.gameplay.fetch_decks'));
        }
    }

    renderDeckSelectors() {
        const decks = this.state.decks;
        if (decks.length > 0) {
            const renderedDecks = decks.map(function (deck) {
                return this.renderDeckSelector(deck);
            }, this);

            return renderedDecks;
        } else {
            return (<div style={{ padding: "50px 50px 0 50px"}}>No subscriptions</div>);
        }
    }

    renderDeckSelector(deck) {
        return (
            <DeckSelector
                key={deck._id}
                id={deck._id}
                name={deck.name}
                description={deck.description}
                image={deck.image}
                price={deck.price}
                price_year={deck.price_year}
                subscribed={deck.subscribed}
                tabChanged={this.props.tabChanged}
            />
        );
    }

    async subscribeAll() {
        const interval = 'YEAR';
        const price = this.state.allDecksPrice;
        const { t } = this.props;

        toast(t('notifications.opening_paypal'), {pauseOnFocusLoss: false});

        try {
            const access_token = await this.getPaypalToken();
            const country = await this.getGeoInfo();
            // CREATE PAYPAL PRODUCT
            const productData = {
                name: "All Decks Bundle",
                description: "Digital Card All Decks",
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
                description: "Digital Card All Decks subscription",
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
                product_id: "all",
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

    async unsubscribeAllPaypal() {
        const {t} = this.props;
        if (this.state.fullSubscriptionId) {
            const access_token = await this.getPaypalToken();
            const subscriptionData = {
                reason: 'Personal decision'
            };
            const subscription = await fetch("https://api.paypal.com/v1/billing/subscriptions/" + this.state.fullSubscriptionId + "/cancel", {
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
        }

        toast.success(t('notifications.unsubscribed'));
    }

    render() {
        const { t } = this.props;
        const isFullSubscription = this.context.user.fullSubscription && this.context.user.fullSubscription !== "false" && new Date(this.context.user.fullSubscription) > new Date() && this.state.fullSubscriptionId;

        return (
            <div className="account_deckSelectors_wrapper">
                <ConfirmPrompt open={this.state.confirmOpen} title={t('gameplay.remove_confirm')} onClose={() => this.setState({confirmOpen: false})} onConfirm={this.unsubscribeAllPaypal} />
                <ul className="account_deckSelectors">
                    {isFullSubscription && <li className="account_deck-selector" data-id="full_subscription">
                        <div className="subscribeDeck_info">
                            <span>{t('gameplay.account_buy_all')}</span>
                        </div>
                        <div className="unsubscribeDeck" onClick={() => this.setState({confirmOpen: true})}>{t('gameplay.unsubscribe')}</div>
                    </li>}
                    {!isFullSubscription && this.renderDeckSelectors()}
                </ul>
            </div>
        );
    }

}

export default withTranslation(AccountDecks);
