import React, { Component } from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './DataProvider';
import AddToHomeScreenIcon from '@material-ui/icons/AddToHomeScreen';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import TranslateIcon from '@material-ui/icons/Translate';
import PeopleIcon from '@material-ui/icons/People';
import UserList from './users/UserList';
import UserCreate from './users/UserCreate';
import UserEdit from './users/UserEdit';
import DeckList from './decks/DeckList';
import DeckCreate from './decks/DeckCreate';
import DeckEdit from './decks/DeckEdit';
import CardCreate from './cards/CardCreate';
import CardEdit from './cards/CardEdit';
import BGCreate from './backgrounds/BGCreate';
import BGEdit from './backgrounds/BGEdit';
import UserDeckCreate from './userDeck/UserDeckCreate';
import UserDeckEdit from './userDeck/UserDeckEdit';
import UserCom from './users/UserCom';
import EditTranslations from './translations/EditTranslations';
import Dashboard from './dashboard/Dashboard';
import CouponList from './coupon/CouponLlist';
import CouponAdd from './coupon/CouponAdd';
import CouponEdit from './coupon/CouponEdit';
// import Setting from './Setting/Setting';
import {Redirect} from "react-router-dom";
import Cookies from "js-cookie";
import {toast} from "react-toastify";
import '../css/Admin.css';

class AdminComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loggedIn: null
        };
    }


    async componentDidMount() {
        const token = Cookies.get('token');
        const preloader = document.getElementById('mainPreloader');

        if(token && token != 'undefined') {
            try {
                const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/tokenLogin", {
                    headers: {"x-access-token": token}
                });
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                const json = await response.json();
                 console.log(json.role);
                if (json.role === 3) {
                    this.setState({
                        loggedIn: true
                    });
                } else {
                    this.setState({
                        loggedIn: false
                    });
                }
            } catch (err) {
                toast.error('Unauthorized');
                this.setState({
                    loggedIn: false
                });
            }
            if (preloader) {
                preloader.classList.add('loaded');
            }
        } else {
            this.setState({
                loggedIn: false
            });
            if (preloader) {
                preloader.classList.add('loaded');
            }
        }
    }

    render() {
        if (this.state.loggedIn === false) {
            return <Redirect to="/login"/>;
        }

        return (
            <>
            <Admin dashboard={Dashboard} dataProvider={dataProvider}>
                <Resource name="decks" list={DeckList} create={DeckCreate} edit={DeckEdit} icon={AddToHomeScreenIcon} />
                <Resource name="cards" create={CardCreate} edit={CardEdit} />
                <Resource name="backgrounds" create={BGCreate} edit={BGEdit} />
                <Resource name="users" list={UserList} create={UserCreate} edit={UserEdit} icon={PeopleIcon} />
                <Resource name="userdeck" create={UserDeckCreate} edit={UserDeckEdit} />
                <Resource name="usercom" list={UserCom} icon={NotificationsActiveIcon}/>
                <Resource name="translations" list={EditTranslations} icon={TranslateIcon}/>
                <Resource name="coupon" list={CouponList} create={CouponAdd} edit={CouponEdit}  />
                {/* <Resource name="setting" list={Setting} />  */}
                {/* <Resource name="coupon-add" list={CouponAdd} />  */}

                <Resource name="roles" />
            </Admin>    

            </>
        );
    }

}

export default AdminComponent;
