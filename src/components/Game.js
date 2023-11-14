import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import { MainContext } from "../Context";
import {withTranslation} from 'react-multi-lang';
import Cookies from 'js-cookie';

const Gameplay = React.lazy(() => import('./Gameplay'));
const Tour = React.lazy(() => import('reactour'));
const token = Cookies.get('token');

class Game extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);
        const { t } = this.props;
        this.state = {
            step: 0,
            isTourOpen: false
        };
        this.tourSteps = [
            {selector: '.step_0', content: t('tutorial.step_0')},
            {selector: '.step_1', content: t('tutorial.step_1')},
            {selector: '.step_2', content: t('tutorial.step_2')},
            {selector: '.step_3', content: t('tutorial.step_3'), stepInteraction: false},
            {selector: '.step_4', content: t('tutorial.step_4'), stepInteraction: false},
            {selector: '.step_5', content: t('tutorial.step_5'), stepInteraction: false},
        ];
        this.showTutorial = this.showTutorial.bind(this);
        this.hideTutorial = this.hideTutorial.bind(this);
        this.updateStep = this.updateStep.bind(this);
        this.nextStep = this.nextStep.bind(this);
    }

    componentDidMount() {
        if (this.context.user.tutorial) {
            this.setState({
                step: this.context.user.tutorial
            })
        }
    }

    showTutorial() {
        this.setState({
            isTourOpen:true
        });
    }

    hideTutorial() {
        this.setState({
            isTourOpen:false
        });
    }

    async updateStep(step) {
        if (this.state.step != step && step <= this.tourSteps.length) {
            const stepTarget = document.getElementsByClassName('step_' + step);
            if (!stepTarget.length) {
                step = (step > this.state.step) ? step + 1 : step - 1;
            }
            this.stateSpecials(step);
            this.setState({
                step: step
            });
            this.context.methods.setTutorialStep(step);
            try {
                const bodyData = {
                    step: step
                };
                const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/updateTutorialStep", {
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
    }

    nextStep() {
        this.updateStep(this.state.step + 1);
    }

    stateSpecials(newStep) {
        switch(newStep) {
            case 1:
                const stepTarget = document.getElementsByClassName('step_1');
                if (stepTarget) {
                    stepTarget[0].style.transition = '0s';
                    stepTarget[0].classList.remove('minimized');
                    setTimeout(function(){
                        stepTarget[0].style.transition = '0.3s';
                    }, 300)
                }
            break;
        }
    }

    render() {
        if (!this.context.isLoggedIn ) {
            return <Redirect to="/login" />;
        }

        return (
            <div className="game-wrapper" style={{border:"0px solid red"}} >
                <Gameplay
                    showTutorial={this.showTutorial}
                    hideTutorial={this.hideTutorial}
                    tutorialUpdateStep={this.updateStep}
                    tutorialNextStep={this.nextStep}
                    tutorialIsOpen={this.state.isTourOpen}
                />
                <Tour 
                    startAt={this.state.step}
                    maskSpace={5}
                    rounded={2}
                    goToStep={this.state.step}
                    steps={this.tourSteps}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={() => this.setState({isTourOpen: false})}
                    showNavigation={false}
                    showNumber={false}
                    disableFocusLock={true}
                    getCurrentStep={(current_step) => { this.updateStep(current_step) }}
                />
            </div>
        );
    }

}

export default withTranslation(Game);
