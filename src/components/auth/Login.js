import React, {Component} from "react";
import './../css/Auth.css';
import { MainContext } from "../../Context";
import { Link, Redirect } from "react-router-dom";
import { withTranslation } from 'react-multi-lang';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import SocialButtons from './SocialButtons';

class Login extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.login = this.login.bind(this);
        this.tokenLogin = this.tokenLogin.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.showModal = this.showModal.bind(this);
    }

    componentDidMount() {
        const token = Cookies.get('token');
        if(token && token != 'undefined' && !this.context.isLoggedIn) {
            this.tokenLogin(token);
        }
    }

    async login(e) {
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
                password: this.context.auth.password
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/login", {
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
            if (preloader) {
                preloader.classList.add('loaded');
            }
            toast.error(t('errors.auth.wrong_credentials'));
        }
    }

    async tokenLogin(token) {
        const { t } = this.props;
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.remove('loaded');
        }
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/tokenLogin", {
                headers: {"x-access-token": token}
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            this.context.methods.setUser(json);
        } catch (err) {
            if (preloader) {
                preloader.classList.add('loaded');
            }
            Cookies.set('token', '');
            toast.error(t('errors.auth.token_expired'));
        }
    }

    async resetPassword(email) {
        const { t } = this.props;
        try {
            const bodyData = {
                email: email,
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/resetPassword", {
                method: 'post',
                headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token},
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }

            toast.success(t('notifications.sent_reset_password'));
        } catch (err) {
            console.log(err);
            toast.error(t('errors.auth.invalid_email'));
        }
    }

    async forgotPassword() {
        const { t } = this.props;

        const suggestion = document.createElement('div');
        const header = document.createElement('h1');
        header.innerHTML = t('auth.reset_password');
        const input = document.createElement('input');
        input.setAttribute('type', 'email');
        input.setAttribute('placeholder', t('auth.email'));
        const button = document.createElement('button');
        button.innerHTML = t('auth.reset_button');
        button.addEventListener('click', () => { this.resetPassword(input.value); this.closeModal(); });
        suggestion.appendChild(header);
        suggestion.appendChild(input);
        suggestion.appendChild(button);
        this.showModal(suggestion);
    }

    showModal(content) {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modal_content');
        const modalClose = document.getElementById('modal_close');
        modal.className = 'active';

        modalClose.addEventListener('click', () => this.closeModal());

        modalContent.innerHTML = '';
        if (typeof content === "string") {
            modalContent.innerHTML = content;
        } else {
            modalContent.appendChild(content);
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modal_content');
        modal.className = '';
        modalContent.innerHTML = '';
    }

    render() {
        if (this.context.isLoggedIn) {
            return <Redirect to="/"/>
        }

        const { t } = this.props;

        return (
            <div className="auth_formwrapper">
                <div className="auth_text">{t('auth.login_text')} <span className="auth_text_blue">{t('auth.login_text_blue')}</span></div>
                <div className="social_auth">
                    <SocialButtons
                        socialLogin={this.props.socialLogin}
                        socialLoginFailure={this.props.socialLoginFailure}
                    />
                </div>
                <form>
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
                        <div className="forgot_password" onClick={this.forgotPassword}>{t('auth.forgot_password')}</div>
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
                    <button type="submit" className="auth_button" onClick={this.login}>{t('auth.login')}</button>
                </form>

                <div id="sign_text">
                    <div><span>{t('auth.new_to_app')}</span><hr/></div> <Link to="/register">{t('auth.signup')}</Link>
                </div>
            </div>
        );
    }
}

export default withTranslation(Login);
