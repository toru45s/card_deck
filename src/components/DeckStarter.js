import React, { Component } from 'react';
import { MainContext } from "../Context";
import './css/DeckStarter.css';
import {withTranslation,getLanguage} from 'react-multi-lang';
import Cookies from "js-cookie";
import {toast} from "react-toastify";

class DeckStarter extends Component {

    static contextType = MainContext;

    constructor(props){
        super(props);

        this.state = {decks: [], language: null};
        this.closeWindow = this.closeWindow.bind(this);
        this.renderDecks = this.renderDecks.bind(this);
        this.filterLanguage = this.filterLanguage.bind(this);
    }

    componentDidMount() {
        if (!this.context.user.guest) {
            this.getDecks();
            this.setState({language: getLanguage()});
            document.getElementById('deck_lang_select').value = getLanguage();
        }          
    }

    async getDecks() {
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.remove('loaded');
        }
        const { t } = this.props;
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getAllDecks", {
                headers: {
                    "x-access-token": this.context.user.token
                }
            });
            if (!response.ok && response.status !== 403) {
                throw Error(response.statusText);
            } else if (response.ok) {
                const json = await response.json();

                if (json.length > 0) {
                    this.setState({decks: json});
                }
                if (preloader) {
                    preloader.classList.add('loaded');
                }
            }
        } catch (err) {
            if (preloader) {
                preloader.classList.add('loaded');
            }
            toast.error(t('errors.gameplay.fetch_decks'));
        }
    }

    closeWindow() {
        this.props.closeWindow();
    }

    toggleNextTime(event) {
        if (event.target.checked) {
            Cookies.set('close_deck_starter', true, { expires: 365 });
        } else {
            Cookies.remove('close_deck_starter');
        }
    }

    renderDecks() {
        const decks = this.state.decks;
        if (decks.length > 0) {
            const renderedDecks = decks.map(function (deck) {
                return this.renderDeck(deck);
            }, this);

            return renderedDecks;
        }
    }

    clickDeck(deck) {
        if (deck.playable) {
            this.props.addDeck(deck);
            document.getElementById('deck-selectors_wrapper').classList.add('minimized');
            setTimeout(() => {
                this.closeWindow();
            }, 300);
        } else {
            this.props.openShop();
            this.closeWindow();
            const shopWindow = document.getElementById('shop_window');

            shopWindow.dispatchEvent(new CustomEvent('showShopDeck', {detail: {deck: deck }}));
        }
    }

    renderDeck(deck) {
        const { t } = this.props;
        const filtered = (deck.languages && this.state.language && deck.languages.indexOf(this.state.language) < 0) ? ' filtered' : '';
        const classList = (deck.playable) ? 'startDeck subscribed' + filtered : 'startDeck not_subscribed' + filtered;
        return (
            <div key={deck._id} className={classList}>
                <div className="deckImageWrapper" >
                    <img src={deck.image} className="pseudoDeck"/>
                    <img src={deck.image} className="pseudoDeck"/>
                    <img src={deck.image} onClick={() => this.clickDeck(deck)}/>
                </div>
                <div className="startDeck_name">{deck.name}</div>
                <div className="startDeck_description">{deck['short_description_'+getLanguage()]}</div>
                <div className={deck.playable? 'startDeck_play' : 'startDeck_buy'}  onClick={() => this.clickDeck(deck)}>{deck.playable ? t('gameplay.play') : t('gameplay.buy')}</div>
            </div>
        );
    }

    filterLanguage(event) {
        if (event.target.value.length > 0) {
            this.setState({language: event.target.value});
        } else {
            this.setState({language: null});
        }
    }

    render() {
        const { t } = this.props;
        const state = (this.props.windowState) ? 'active' : 'inactive';
        const classes = 'deckStarter_wrapper ' + state;

        return (
            <div className={classes} id="deckStarter">
                <div id="deckStarter_window">
                    <h2>{t('gameplay.welcome')}</h2>
                    <h1>{t('gameplay.choose_deck_start')}</h1>
                    <div id="deckStarter_content">
                        <label>
                            <p className="deck-language"><b>{t('gameplay.deck_language')}</b></p>
                            <div id="deck_lang_select--globe"/>
                            <div className="deck_lang_select_wrapper">
                                <select id="deck_lang_select" onChange={this.filterLanguage} defaultValue={getLanguage()}>
                                    <option value="">{t('gameplay.any_language')}</option>
                                    <option value="en">English</option>
                                    <option value="ukr">Ukrainian</option>
                                    <option value="pl">Polish</option>
                                    <option value="cz">Czech</option>
                                    <option value="il">Hebrew</option>
                                    <option value="spa">Spanish</option>
                                    <option value="zh">Chinese</option>
                                </select>
                                <p className="chevron"></p>
                            </div>
                        </label>
                        <div id="deckStarter_decks">{this.renderDecks()}</div>
                    </div>
                    <div id="deckStarter_bottom">
                        <label>
                            <input type="checkbox" id="deckStarter_checkbox"  onChange={this.toggleNextTime}/>
                            {t('gameplay.deckstarter_dont_show')}
                        </label>
                    </div>
                    <div id="deckStarter_close" style={{border:"0px solid red"}} onClick={this.closeWindow} />
                </div>
            </div>
        );
    }

}

export default withTranslation(DeckStarter);
