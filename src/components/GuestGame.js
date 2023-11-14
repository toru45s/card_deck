import React, { Component } from 'react';
import { MainContext } from "../Context";
import Gameplay from './Gameplay';
import './css/Game.css';
import {toast} from "react-toastify";
import { withTranslation } from 'react-multi-lang';

class GuestGame extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);
        this.guestLogin = this.guestLogin.bind(this);
        this.renderDecks = this.renderDecks.bind(this);
        this.guestLogin = this.guestLogin.bind(this);
    }

    componentDidMount() {
        this.guestLogin();
    }

    async guestLogin() {
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.remove('loaded');
        }
        const { t } = this.props;

        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + window.location.pathname, {
                headers: {"Content-Type": "application/json"}
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();
            this.context.methods.setUser(json);
            if (preloader) {
                preloader.classList.add('loaded');
            }
        } catch (err) {
            if (preloader) {
                preloader.classList.add('loaded');
            }
            toast.error(t('errors.auth.guest_session_unavailable'));
        }
    }

    renderDecks() {
        if (this.context.user.guest) {
            return (
                <Gameplay />
            );
        } else {
            return (<p>Logging in...</p>);
        }
    }

    render() {
        return (
            <div className="game-wrapper">
                {this.renderDecks()}
            </div>
        );
    }

}

export default withTranslation(GuestGame);
