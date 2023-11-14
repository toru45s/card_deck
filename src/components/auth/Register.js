import React, {Component} from "react";
import './../css/Auth.css';
import { MainContext } from "../../Context";
import { Link, Redirect } from "react-router-dom";
import { withTranslation, getLanguage } from 'react-multi-lang';
import { toast } from 'react-toastify';
import SocialButtons from "./SocialButtons";

class Register extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.register = this.register.bind(this);
    }

    async register(e) {
        e.preventDefault();
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.remove('loaded');
        }
        const { t } = this.props;

        try {
            const bodyData = {
                email: this.context.auth.email,
                username: this.context.auth.username,
                password: this.context.auth.password,
                language: getLanguage()
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/register", {
                method: 'post',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            this.context.methods.setUser(json);
        } catch (err) {
            preloader.classList.add('loaded');
            console.log(err);
            toast.error(t('errors.auth.username_taken'));
        }
    }

    render() {
        if (this.context.isLoggedIn) {
            return <Redirect to="/"/>
        }

        const { t } = this.props;

        return (
                <div className="auth_formwrapper">
                    <div className="trial_disclaimer">{t('auth.trial_disclaimer')}</div>
                    <div className="social_auth">
                        <SocialButtons
                            socialLogin={this.props.socialLogin}
                            socialLoginFailure={this.props.socialLoginFailure}
                        />
                    </div>
                    <form>
                        <label htmlFor="username">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                aria-label="email"
                                aria-required="true"
                                placeholder={t('auth.email')}
                                onChange={this.context.methods.setLogin}
                                value={this.context.auth.email}
                            />
                        </label>
                        <label htmlFor="username">
                            <input
                                type="text"
                                name="username"
                                id="username"
                                aria-label="username"
                                aria-required="true"
                                placeholder={t('auth.username')}
                                onChange={this.context.methods.setLogin}
                                value={this.context.auth.username}
                            />
                        </label>
                        <label htmlFor="password">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                aria-label="password"
                                aria-required="true"
                                placeholder={t('auth.password')}
                                onChange={this.context.methods.setLogin}
                                value={this.context.auth.password}
                            />
                        </label>
                        <button type="submit" className="auth_button" onClick={this.register}>{t('auth.signup')}</button>
                    </form>

                    <div id="sign_text">
                        <div><span>{t('auth.already_registered')}</span><hr/></div> <Link to="/login">{t('auth.login')}</Link>
                    </div>
                </div>
        );
    }
}

export default withTranslation(Register);
