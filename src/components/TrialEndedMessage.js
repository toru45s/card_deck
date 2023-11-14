import React, { Component } from 'react';
import { MainContext } from "../Context";
import {getLanguage, withTranslation} from 'react-multi-lang';

import './css/TrialEndedMessage.css';

class TrialEndedMessage extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);
        this.state = {
            text: false,
            error: "Oops, something went wrong. Please try again later."
        };
    }

async componentDidMount() {
  try {
    const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getTrialEndedText", {
        headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token}
    });
    if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
    }
    const json = await response.json();
    this.setState({text: json});
  } catch (error) {
    console.error(error);
    // handle the error here, e.g. display a user-friendly message
    this.setState({error: "Oops, something went wrong. Please try again later."});
  }
}


    async closeWindow() {
        this.context.methods.setTrialEnded(false);
        // await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/trialEndedConfirm", {
        //     headers: {"Content-Type": "application/json", "x-access-token": this.context.user.token}
        // });
    }

    render() {

        const { error } = this.state;
        if (error) {
            return <div>{error}</div>;
          }
          
        if (!this.context?.user?.trialEnded || !this.state.text) return false;
        const { t } = this.props;

        return (
            <div className="trialEndedWrapper">
                <div>{error?error : null}</div>
                <div className="trialEnded">
                    <div id="trialEnded_close" onClick={() => this.closeWindow()} />
                    <div dangerouslySetInnerHTML={{__html: this.state.text["trial_ended_"+getLanguage()]?.value }}/>
                    <div className="closeButton" onClick={() => this.closeWindow()}>{t('gameplay.close')}</div>
                </div>
            </div>
        );
    }

}

export default withTranslation(TrialEndedMessage);
