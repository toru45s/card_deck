import React, { Component } from 'react';
import './css/DeckSelector.css';
import { withTranslation } from 'react-multi-lang';
import {MainContext} from "../Context";
import ConfirmPrompt from "./ConfirmPrompt";

class DeckSelector extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.addDeck = this.addDeck.bind(this);
        this.deleteDeck = this.deleteDeck.bind(this);
        this.getActiveDeck = this.getActiveDeck.bind(this);
        this.state = {
            confirmOpen: false,
            confirmTitle: "",
            onConfirm: () => {}
        };
    }


    async addDeck() {
        this.props.addDeck(this.props.deck);
    }

    async deleteDeck() {
        const { t } = this.props;
        this.setState({confirmOpen: true, confirmTitle: t('gameplay.remove_confirm'), onConfirm: () => this.props.removeDeck(this.getActiveDeck())});
    }

    getActiveDeck() {
        return (this.props.activeDecks.find(x => x.id === this.props.deck._id));
    }

    render() {
        const activeDeck = this.getActiveDeck();
        return (
            <>
                <ConfirmPrompt open={this.state.confirmOpen} title={this.state.confirmTitle} onClose={() => this.setState({confirmOpen: false})} onConfirm={this.state.onConfirm} />
                <div  className={(activeDeck) ? "deck-selector active" : "deck-selector"} onClick={() => activeDeck ? this.deleteDeck() : this.addDeck()}><img src={this.props.deck.image}/>{this.props.deck.name}</div>
            </>
        );
    }

}

export default withTranslation(DeckSelector);
