import React, {Component} from "react";
import './../css/Auth.css';
import { MainContext } from "../../Context";
import { Redirect } from "react-router-dom";
import {getLanguage, withTranslation} from 'react-multi-lang';
import { toast } from 'react-toastify';
import Lang from "../Lang";
import Login from "./Login";
import Register from "./Register";
import Cookies from "js-cookie";

class Auth extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.showModal = this.showModal.bind(this);
        this.socialLogin = this.socialLogin.bind(this);

        this.benefitsBlockRef          = React.createRef();
        this.videoBlockRef          = React.createRef();
        this.testimonialsBlockRef   = React.createRef();
        this.aboutBlockRef          = React.createRef();

        this.state = {
            registration: props.registration || false
        };
    }

    componentDidMount() {
        const canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', process.env.REACT_APP_DOMAIN + "/");
        document.head.appendChild(canonical);
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.add('loaded');
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

    startVideo(event) {
        const video = document.getElementById('home_short_video');
        video.play();
        video.controls = true;
        event.target.parentElement.remove();
    }

    async socialLoginFailure(err) {
        console.log(err);
    }

    async socialLogin(user) {
        const { t } = this.props;
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.remove('loaded');
        }

        try {
            const bodyData = {
                socialId: user._profile.id,
                email: user._profile.email,
                name: user._profile.firstName
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/socialLogin", {
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
            Cookies.set('token', '');
            toast.error(t('errors.auth.no_social'));
        }
    }

    render() {
        if (this.context.isLoggedIn) {
            return <Redirect to="/"/>
        }

        const { t } = this.props;

        return (
            <div className="auth_wrapper">
                <div className="bg_shadow"/>
                <div className="auth_bg"/>
                <div id="modal">
                    <div id="modal_window">
                        <div id="modal_content" />
                        <div id="modal_close" />
                    </div>
                </div>
                <div className="container">
                    <div className="header">
                        <div className="logo_wrapper">
                            <div className="logo"/>
                            <div className="logo_text_wrapper">
                                <div className="logo_text">{t('auth.logo_text')}</div>
                                <div className="logo_subtext">{t('auth.logo_subtext')}</div>
                            </div>
                        </div>
                        <ul className="header_menu">
                            <li onClick={() => this.videoBlockRef.current.scrollIntoView()}>{t('auth.video')}</li>
                            <li onClick={() => this.testimonialsBlockRef.current.scrollIntoView()}>{t('auth.testimonials')}</li>
                            <li onClick={() => this.aboutBlockRef.current.scrollIntoView()}>{t('auth.about')}</li>
                        </ul>
                        <Lang />
                    </div>

                    <div className="homeAuthPage">
                        <div className="homeAuthPage_screen">
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                            <div className="homeAuthPage_screen-card"/>
                        </div>
                        <h1 className="motto">{t('auth.motto')} <span className="bluetext">{t('auth.motto_blue')}</span></h1>
                        <div className="auth_container">
                            {this.state.registration
                                ? <Register socialLogin={this.socialLogin} socialLoginFailure={this.socialLoginFailure} />
                                : <Login socialLogin={this.socialLogin} socialLoginFailure={this.socialLoginFailure} />
                            }
                        </div>
                        <div className="arrow_down" onClick={() => this.benefitsBlockRef.current.scrollIntoView()} />
                    </div>
                </div>
                <div className="homeBenefits" ref={this.benefitsBlockRef}>
                    <div className="container">
                        <h2><b>{t('auth.virtual_cards')}</b> {t('auth.virtual_cards_description')} <br/><span className="bluetext"><b>{t('auth.virtual_cards_description_blue')}</b></span></h2>
                        <div className="homeBenefits_benefits">
                            <div className="homeBenefits_benefit">
                                <div className="benefitIcons benefitIcon_accessible" />
                                <h3>{t('auth.benefits_accessible')}</h3>
                                <p>{t('auth.benefits_accessible_description')}</p>
                            </div>
                            <div className="homeBenefits_benefit">
                                <div className="benefitIcons benefitIcon_floppy" />
                                <h3>{t('auth.benefits_save_sessions')}</h3>
                                <p>{t('auth.benefits_save_sessions_description')}</p>
                            </div>
                            <div className="homeBenefits_benefit">
                                <div className="benefitIcons benefitIcon_people" />
                                <h3>{t('auth.benefits_people')}</h3>
                                <p>{t('auth.benefits_people_description')}</p>
                            </div>
                            <div className="homeBenefits_benefit">
                                <div className="benefitIcons benefitIcon_decks" />
                                <h3>{t('auth.benefits_decks')}</h3>
                                <p>{t('auth.benefits_decks_description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="homeWatchVideo" ref={this.videoBlockRef}>
                    <div className="container">
                        <h2><b>{t('auth.watch')}</b> {t('auth.how_it_works')}</h2>
                        <div className="homeWatchVideo_content">
                            <p>{t('auth.how_it_works_text')}</p>
                            <div className="homeWatchVideo_videowrapper">
                                <video id="home_short_video" autoPlay muted controls>
                                    <source src="/briefer.mp4" type="video/mp4"/>
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="homeTestimonials" ref={this.testimonialsBlockRef}>
                    <div className="container">
                        <h2><b>{t('auth.our')}</b> {t('auth.users')}</h2>
                        <div className="homeTestimonials_content">
                            <div className="homeTestimonials_testimonial">
                                <div className="homeTestimonials_testimonial-header">{t('auth.testimonial_1_name')}</div>
                                <div className="homeTestimonials_testimonial-text">{t('auth.testimonial_1_text')}</div>
                            </div>
                            <div className="homeTestimonials_testimonial">
                                <div className="homeTestimonials_testimonial-header">{t('auth.testimonial_2_name')}</div>
                                <div className="homeTestimonials_testimonial-text">{t('auth.testimonial_2_text')}</div>
                            </div>
                            <div className="homeTestimonials_testimonial">
                                <div className="homeTestimonials_testimonial-header">{t('auth.testimonial_3_name')}</div>
                                <div className="homeTestimonials_testimonial-text">{t('auth.testimonial_3_text')}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="homeAbout" ref={this.aboutBlockRef}>
                    <div className="container">
                        <h2><b>{t('auth.about')}</b> {t('auth.us')}</h2>
                        <h3 className="homeAbout_description">{t('auth.about_description')}</h3>
                        <div className="homeTeam">
                            <div className="teamMember">
                                <div className="teamMember_1_photo"/>
                                <div className="teamMember_name">{t('auth.team_member_1_name')}</div>
                                <div className="teamMember_position">{t('auth.team_member_1_position')}</div>
                                <div className="teamMember_short_description">{t('auth.team_member_1_short_description')}</div>
                                <div className="arrow_right" onClick={() => this.showModal(t('auth.team_member_1_full_description'))} />
                            </div>
                            <div className="teamMember">
                                <div className="teamMember_2_photo"/>
                                <div className="teamMember_name">{t('auth.team_member_2_name')}</div>
                                <div className="teamMember_position">{t('auth.team_member_2_position')}</div>
                                <div className="teamMember_short_description">{t('auth.team_member_2_short_description')}</div>
                                <div className="arrow_right" onClick={() => this.showModal(t('auth.team_member_2_full_description'))} />
                            </div>
                            <div className="teamMember">
                                <div className="teamMember_3_photo"/>
                                <div className="teamMember_name">{t('auth.team_member_3_name')}</div>
                                <div className="teamMember_position">{t('auth.team_member_3_position')}</div>
                                <div className="teamMember_short_description">{t('auth.team_member_3_short_description')}</div>
                                <div className="arrow_right" onClick={() => this.showModal(t('auth.team_member_3_full_description'))} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="homeFooter">
                    <div className="container">
                        <h2><b>{t('auth.contact')}</b> {t('auth.us')}</h2>
                        <div className="homeFooter_links">
                            <a className="social_whatsapp" href="https://wa.me/97233761175" target="_blank" rel="noopener noreferrer" />
                            <a className="social_facebook" href="https://www.facebook.com/Digi-Card-Therapy-108619447678729" target="_blank" rel="noopener noreferrer" />
                            <a className="social_email" href="mailto:digicardtherapy@gmail.com" target="_blank" rel="noopener noreferrer" />
                        </div>
                        <div className="footer_copyright" dangerouslySetInnerHTML={{__html: t('auth.copyright') }}/>
                        <div className="footer_cookies">{t('auth.cookies')}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation(Auth);