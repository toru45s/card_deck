import React, {Component} from "react";
import './css/Auth.css';
import { MainContext } from "../Context";
import { withTranslation } from 'react-multi-lang';

class NotFound extends Component {

    static contextType = MainContext;

    componentDidMount() {
        const preloader = document.getElementById('mainPreloader');
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }

    render() {
        const { t } = this.props;

        return (
            <div className="auth_wrapper">
                <div className="notfound">
                    <div className="header">
                        <div className="logo_wrapper">
                            <div className="logo"/>
                            <div className="logo_text_wrapper">
                                <div className="logo_text">{t('auth.logo_text')}</div>
                                <div className="logo_subtext">{t('auth.logo_subtext')}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1>404</h1>
                        <h2>The page you're looking for was not found</h2>
                        <h3 style={{ marginTop: "20px"}}>Go to <a href="/">Homepage</a></h3>
                    </div>

                    <div className="bg_shadow"/>
                    <div className="auth_bg"/>
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
            </div>
        );
    }
}

export default withTranslation(NotFound);