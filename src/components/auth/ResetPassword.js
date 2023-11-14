import React, { Component } from 'react';
import '../css/ResetPassword.css';
import {toast} from "react-toastify";
import { withTranslation } from 'react-multi-lang';

class ResetPassword extends Component {

    constructor(props) {
        super(props);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidMount() {
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }

    async updatePassword(password) {
        const { t } = this.props;

        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/updatePassword", {
                method: 'post',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ reset_token: this.props.match.params.token, password: password })
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }

            toast.success(t('notifications.password_reset_success'));
            this.props.history.push('/');
        } catch (err) {
            console.log(err);
            toast.error(t('errors.auth.password_reset'));
        }
    }

    render() {
        const { t } = this.props;

        return (
            <div className="reset_password">
                <input type="password" id="password" placeholder={t('auth.password')}/>
                <button onClick={() => { this.updatePassword(document.getElementById('password').value) }}>{t('auth.reset_button')}</button>
            </div>
        );
    }

}

export default withTranslation(ResetPassword);
