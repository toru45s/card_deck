import React, { Component } from 'react';
import {getLanguage, setLanguage} from "react-multi-lang";
import Cookies from 'js-cookie';
import {MainContext} from "../Context";

class Lang extends Component {

    static contextType = MainContext;

    async rememberLanguage(lang) {
        if (!this.context.isLoggedIn) {
            return false;
        }

        try {
            const bodyData = {
                language: getLanguage()
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/rememberLanguage", {
                method: 'post',
                headers: {"x-access-token": this.context.user.token, "Content-Type": "application/json"},
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <div className="lang">
                <div className="lang_selector">
                    <span>{ getLanguage().toUpperCase() }</span>
                    <p className="chevron"></p>
                </div>
                <button onClick={() => { Cookies.set('lang', 'en', { expires: 365 }); setLanguage('en'); this.rememberLanguage() }}>EN</button>
                <button onClick={() => { Cookies.set('lang', 'il', { expires: 365 }); setLanguage('il'); this.rememberLanguage() }}>IL</button>
                <button onClick={() => { Cookies.set('lang', 'spa', { expires: 365 }); setLanguage('spa'); this.rememberLanguage() }}>SPA</button>
                <button onClick={() => { Cookies.set('lang', 'zh', { expires: 365 }); setLanguage('zh'); this.rememberLanguage() }}>ZH</button>
                <button onClick={() => { Cookies.set('lang', 'ukr', { expires: 365 }); setLanguage('ukr'); this.rememberLanguage() }}>UKR</button>
                <button onClick={() => { Cookies.set('lang', 'pl', { expires: 365 }); setLanguage('pl'); this.rememberLanguage() }}>PL</button>
                <button onClick={() => { Cookies.set('lang', 'cz', { expires: 365 }); setLanguage('cz'); this.rememberLanguage() }}>CZ</button>
            </div>
        );
    }

}

export default Lang;
