import React, { Component } from 'react';
import { MainContext } from "../../Context";
import { withTranslation } from 'react-multi-lang';
import {toast} from "react-toastify";
import Dropzone from 'react-dropzone'
// import Painterro from "painterro";
import BrushIcon from '@material-ui/icons/Brush';

class AccountPersonal extends Component {

    static contextType = MainContext;

    constructor(props){
        super(props);

        this.state = {email: '', username: '', eula: false, backgrounds: []};
        this.updateUser = this.updateUser.bind(this);
        this.openShop = this.openShop.bind(this);
        this.setLogin = this.setLogin.bind(this);
        this.setEULA = this.setEULA.bind(this);
        this.uploadBackground = this.uploadBackground.bind(this);
        this.deleteBackground = this.deleteBackground.bind(this);
    }

    componentDidMount() {
        this.setState({email: this.context.user.email, username: this.context.user.username, eula: this.context.user.eula, backgrounds: this.context.user.backgrounds});
    }

    setLogin(e) {
        const data = e.target.value;

        switch (e.target.getAttribute("id")) {
            case "email":
                this.setState(state => ({
                    ...state,
                    email: data
                }));
            break;
            case "username":
                this.setState(state => ({
                    ...state,
                    username: data
                }));
            break;
        }
    }

    setEULA(e) {
        this.setState(state => ({
            ...state,
            eula: !this.state.eula
        }));
    }

    async updateUser(e){
        const { t } = this.props;
        e.preventDefault();
        try {
            const bodyData = {
                email: this.state.email,
                username: this.state.username,
                eula: this.state.eula
            };
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/updateUser", {
                method: 'post',
                headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token},
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            this.context.methods.setUser(json);
            toast.success(t('notifications.account_user_updated'));
        } catch (err) {
            console.log(err);
            toast.error(t('errors.gameplay.account_user_update'));
        }
    }

    openShop() {
        this.props.closeAccount();
        this.props.openShop();
    }

    async uploadBackgrounds(files) {
        if (files.length) {
            files.forEach(async (file) => {
                this.uploadBackground(file);
            });
        }
    }

    async uploadBackground(file) {
        const { t } = this.props;
        const formData = new FormData();

        formData.append(
            "background",
            file,
            file.name
        );

        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/uploadUserBackground", {
                method: 'post',
                headers: {"x-access-token": this.context.user.token},
                body: formData
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();
            this.setState({backgrounds: json});
            this.context.methods.setBackgrounds(json);
            this.props.syncBackgrounds(json);
        } catch (err) {
            console.log(err);
            toast.error(t('errors.gameplay.background_upload_error'));
        }
    }

    async deleteBackground(background) {
        const { t } = this.props;
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/deleteUserBackground", {
                method: 'post',
                headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token},
                body: JSON.stringify({background: background})
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();
            this.setState({backgrounds: json});
            this.context.methods.setBackgrounds(json);
            this.props.syncBackgrounds(json);
        } catch (err) {
            console.log(err);
            toast.error(t('errors.gameplay.background_not_found'));
        }
    }

    renderBackgrounds() {
        const backgrounds = this.state.backgrounds;
        return backgrounds.map(function (background) {
            return this.renderBackground(background);
        }, this)
    }

    renderBackground(background) {
        return (
            <div className="account_background">
                <div className="shadow"/>
                <img src={background} alt="" title=""/>
                <div className="account_background-delete" onClick={() => this.deleteBackground(background)}/>
            </div>
        );
    }

    toggleDrawbox(show) {
        this.props.setShowDrawbox(show);
        setTimeout(() => {
            const drawbox = window.Painterro({
                id: "painterro",
                defaultTool: "brush",
                activeColorAlpha: .5,
                hiddenTools: ["settings"],
                onClose: () => {
                    this.props.setShowDrawbox(false);
                },
                saveHandler: async (image, done) => {
                    await this.uploadBackground(image.asBlob());
                    done(true);
                    this.props.setShowDrawbox(false);
                }
            });
            show ? drawbox.show() : drawbox.hide();
        }, 0);
    }

    render() {
        const { t } = this.props;
        return (
            <div className="account_personal">
                {!this.context.user.guest &&
                <div className="account_formwrapper">
                    <form>
                        <label htmlFor="email">
                            <span>{t('auth.email')}</span>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                aria-label="email"
                                aria-required="true"
                                placeholder={t('auth.email')}
                                onChange={this.setLogin}
                                value={this.state.email}
                            />
                        </label>
                        <label htmlFor="username">
                            <span>{t('auth.username')}</span>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                aria-label="username"
                                aria-required="true"
                                placeholder={t('auth.username')}
                                onChange={this.setLogin}
                                value={this.state.username}
                            />
                        </label>
                        <label htmlFor="language">
                            <div className="deck_lang_select_wrapper">
                                <span>{t('gameplay.language')}</span>
                                <select id="deck_lang_select" defaultValue={this.context.user.language}>
                                    <option value="en">English</option>
                                    <option value="il">Hebrew</option>
                                    <option value="spa">Spanish</option>
                                    <option value="zh">Chinese</option>
                                </select>
                                <p className="chevron"></p>
                            </div>
                        </label>
                        <label htmlFor="role">
                            <div className="deck_role_wrapper">
                                <span>{t('gameplay.role')}</span>
                                <input
                                    type="text"
                                    name="role"
                                    id="role"
                                    aria-label="role"
                                    disabled={true}
                                    value={t('gameplay.role_' + this.context.user.role)}
                                />
                                <button type="button" className="accountUpgrade_button"
                                        onClick={this.openShop}>{t('gameplay.upgrade')}</button>
                            </div>
                        </label>
                        <label htmlFor="eula">
                            <input
                                name="eula"
                                type="checkbox"
                                checked={this.state.eula}
                                onChange={this.setEULA}
                            />
                            {t('gameplay.i_agree')} <a href="/eula.html" target="_blank">{t('gameplay.eula')}</a>
                        </label>
                        <button type="submit" className="account_button"
                                onClick={this.updateUser}>{t('gameplay.account_save_button')}</button>
                        <button type="button" className="account_logout_button"
                                onClick={this.props.logout}>{t('gameplay.logout')}</button>
                    </form>
                </div>
                }
                <div className={this.context.user.guest ? "account_backgrounds fullwidth" : "account_backgrounds"}>
                    <p>{t('gameplay.upload_backgrounds')}</p>
                    <div className="account_backgrounds-list">
                        <Dropzone onDrop={acceptedFiles => this.uploadBackgrounds(acceptedFiles)}>
                            {({getRootProps, getInputProps}) => (
                                <section>
                                    <div {...getRootProps()}>
                                        <div className="account_backgrounds-add">
                                            <input type="file" accept="image/jpeg" onChange={(event) => this.uploadBackground(event.target.files[0])} {...getInputProps()}/>
                                            <div className="account_backgrounds-plus"/>
                                            <div className="account_background-hint">{t('gameplay.account_upload_backgrounds_hint')}</div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                        <div className="account_backgrounds-add" onClick={() => this.toggleDrawbox(true)}>
                            <BrushIcon className="account_backgrounds-draw"/>
                            <div className="account_background-hint">Draw</div>
                        </div>
                        {this.renderBackgrounds()}
                    </div>
                </div>
            </div>
        );
    }

}

export default withTranslation(AccountPersonal);
