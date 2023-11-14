import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom";
import { setTranslations, setDefaultLanguage, withTranslation } from 'react-multi-lang';
import en from './translations/en.json';
import il from './translations/il.json';
import spa from './translations/spa.json';
import ukr from './translations/ukr.json';
import pl from './translations/pl.json';
import cz from './translations/cz.json';
import zh from './translations/zh.json';
import Cookies from 'js-cookie';

import CardCheckout from './components/shop/CardCheckout';
import Shop from './components/shop/Shop';

// Components
const Auth = React.lazy(() => import('./components/auth/Auth'));
const Game = React.lazy(() => import('./components/Game'));
const GuestGame = React.lazy(() => import('./components/GuestGame'));
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const AdminComponent = React.lazy(() => import('./components/admin/AdminComponent'));
const NotFound = React.lazy(() => import('./components/NotFound'));


setTranslations({ en, il, spa, zh, ukr, pl, cz });

if (Cookies.get('lang') === "en" || Cookies.get('lang') === "il" || Cookies.get('lang') === "spa" || Cookies.get('lang') === "zh" || Cookies.get('lang') === "ukr" || Cookies.get('lang') === "pl" || Cookies.get('lang') === "cz" ) {
    setDefaultLanguage(Cookies.get('lang'));
} else {
    setDefaultLanguage('en');
}

class App extends Component {

    componentDidMount() {
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }

    render() {
        const { t } = this.props;

        return (
            <div className="app">
                <Switch>
                    <Route exact path="/" component={Game} />
                    <Route path="/login" component={() => <Auth registration={false} />} />
                    <Route path="/register" component={() => <Auth registration={true} />} />
                    <Route path="/join" component={GuestGame} />
                    <Route path="/cart-checkout" component={CardCheckout} />
                    <Route path="/reset_password/:token" component={ResetPassword} />
                    <Route path="/admin" component={AdminComponent} />
                    <Route path="*" exact={true} component={NotFound} />
                </Switch>

                <div id="modal">
                    <div id="modal_window">
                        <div id="modal_content" />
                        <div id="modal_close" />
                        <div className="modal_bottom_buttons">
                            <div className="closeButton" id="dupeCloseButton">{t('gameplay.close')}</div>
                        </div>
                    </div>
                </div>
                <div id="modal_draggable">
                    <div id="modal_draggable_window">
                        <div id="modal_draggable_content" />
                        <div id="modal_draggable_close" />
                        <div className="modal_bottom_buttons">
                            <div className="closeButton" id="draggableDupeCloseButton">{t('gameplay.close')}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default withTranslation(App);
