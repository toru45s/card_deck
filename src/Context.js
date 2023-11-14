import React, { Component } from "react";
import Cookies from "js-cookie";

const MainContext = React.createContext(null);
const token = Cookies.get('token');

class MainProvider extends Component {

    state = {
        auth: {
            email: "",
            username: "",
            password: ""
        },
        user: {
            email: "",
            username: "",
            decks: [],
            session: null,
            guest: false,
            eula: false,
            message: '',
            backgrounds: [],
            tutorial: 0,
            inviteCode: "",
            trialEnded: false,
            multipleAllowed: false,
            fullSubscription: false,
            token: token?token:""
        },
        isLoggedIn: token?true:false,
    };

    change = {
        setLogin: e => {
            const data = e.target.value;
            switch (e.target.getAttribute("id")) {
                case "email":
                    this.setState(state => ({
                        ...state,
                        auth: {
                            ...state.auth,
                            email: data
                        }
                    }));
                    break;
                case "username":
                    this.setState(state => ({
                        ...state,
                        auth: {
                            ...state.auth,
                            username: data
                        }
                    }));
                    break;
                case "password":
                    this.setState(state => ({
                        ...state,
                        auth: {
                            ...state.auth,
                            password: data
                        }
                    }));
                    break;
                default:
                    return;
            }
        },
        setUser: user => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    token: user.token,
                    decks: user.decks,
                    message: user.message,
                    eula: user.eula,
                    language: user.language,
                    role: user.role,
                    backgrounds: user.backgrounds,
                    guest: (typeof user.guest !== "undefined") ? user.guest : false,
                    tutorial: user.tutorial,
                    inviteCode: user.inviteCode || "",
                    trialEnded: user.trialEnded || false,
                    multipleAllowed: user.multipleAllowed || false,
                    fullSubscription: user.fullSubscription || false,
                },
                isLoggedIn: true
            }));
            if (typeof user.token !== "undefined" && !user.guest) {
                Cookies.set('token', user.token, { expires: 365 });
            }
        },
        resetUser: user => {
            this.setState( state => ({
                ...state,
                user: {
                    email: "",
                    username: "",
                    decks: [],
                    session: null,
                    guest: false,
                    eula: false,
                    tutorial: 0,
                    inviteCode: "",
                    trialEnded: false,
                    multipleAllowed: false,
                    fullSubscription: false
                },
                isLoggedIn: false
            }))
        },
        setDecks: updatedDecks => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    decks: updatedDecks
                }
            }))
        },
        setBackgrounds: updatedBackgrounds => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    backgrounds: updatedBackgrounds
                }
            }))
        },
        setSession: session => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    session: session
                }
            }))
        },
        setTutorialStep: step => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    tutorial: step
                }
            }))
        },
        setInviteCode: code => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    inviteCode: code
                }
            }))
        },
        setTrialEnded: trialEnded => {
            this.setState(state => ({
                ...state,
                user: {
                    ...state.user,
                    trialEnded
                }
            }))
        },
        setMultipleAllowed: multipleAllowed => {
            this.setState( state => ({
                ...state,
                user: {
                    ...state.user,
                    multipleAllowed
                }
            }))
        }
    };

    dataMethods = {

    };

    render() {
        return (
            <MainContext.Provider
                value={{
                    ...this.state,
                    methods: this.change,
                    dataMethods: this.dataMethods
                }}
            >
                {this.props.children}
            </MainContext.Provider>
        );
    }
}

const MainConsumer = MainContext.Consumer;

export { MainContext, MainProvider, MainConsumer };
