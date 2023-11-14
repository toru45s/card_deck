import React, { Component } from 'react';
import { withTranslation } from 'react-multi-lang';
import SocialButton from './SocialButton';

class ResetPassword extends Component {

    render() {
        const { t } = this.props;

        return (
            <>
                <SocialButton
                    className="google_login"
                    provider='google'
                    appId={process.env.REACT_APP_AUTH_GOOGLE_ID}
                    onLoginSuccess={this.props.socialLogin}
                    onLoginFailure={this.props.socialLoginFailure}
                >{t('auth.login_google')}</SocialButton>

                <SocialButton
                    className="facebook_login"
                    provider='facebook'
                    appId={process.env.REACT_APP_AUTH_FACEBOOK_ID}
                    onLoginSuccess={this.props.socialLogin}
                    onLoginFailure={this.props.socialLoginFailure}
                >{t('auth.login_facebook')}</SocialButton>
            </>
        );
    }

}

export default withTranslation(ResetPassword);
