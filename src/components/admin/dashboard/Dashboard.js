import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import { Title } from 'react-admin';
import MonthlyRevenue from './MonthlyRevenue';
import Connections from './Connections';
import DollarIcon from '@material-ui/icons/AttachMoney';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import './Dashboard.css';
import Cookies from "js-cookie";
import {toast} from "react-toastify";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomToolbar from "../QuillToolbar";

class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            revenue: 0,
            connections:0,
            options: {
                admin_email: "",
                decks_total_price: "0.00",
                interface_info_en: "",
                interface_info_il: "",
                interface_info_spa: "",
                interface_info_zh: "",
                interface_info_ukr: "",
                interface_info_pl: "",
                interface_info_cz: "",
                trial_ended_en: "",
                trial_ended_il: "",
                trial_ended_spa: "",
                trial_ended_zh: "",
                trial_ended_ukr: "",
                trial_ended_pl: "",
                trial_ended_cz: ""
            },
            enModules: new CustomToolbar(),
            ilModules: new CustomToolbar(),
            spaModules: new CustomToolbar(),
            zhModules: new CustomToolbar(),
            ukrModules: new CustomToolbar(),
            plModules: new CustomToolbar(),
            czModules: new CustomToolbar(),
            enTrialModules: new CustomToolbar(),
            ilTrialModules: new CustomToolbar(),
            spaTrialModules: new CustomToolbar(),
            zhTrialModules: new CustomToolbar(),
            ukrTrialModules: new CustomToolbar(),
            plTrialModules: new CustomToolbar(),
            czTrialModules: new CustomToolbar()
        };

        this.saveOptions = this.saveOptions.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleAllDecksPriceChange = this.handleAllDecksPriceChange.bind(this);
    }
    async componentDidMount(){
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getDashInfo", {
                headers: {"x-access-token": Cookies.get('token')}
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();
            this.setState({
                revenue: json.revenue,
                connections: json.connections,
                options: {
                    admin_email: json.admin_email?.value || "",
                    decks_total_price: json.decks_total_price?.value || "",
                    interface_info_en: json.interface_info_en?.value || "",
                    interface_info_il: json.interface_info_il?.value || "",
                    interface_info_spa: json.interface_info_spa?.value || "",
                    interface_info_zh: json.interface_info_zh?.value || "",
                    interface_info_ukr: json.interface_info_ukr?.value || "",
                    interface_info_pl: json.interface_info_pl?.value || "",
                    interface_info_cz: json.interface_info_cz?.value || "",
                    trial_ended_en: json.trial_ended_en?.value || "",
                    trial_ended_il: json.trial_ended_il?.value || "",
                    trial_ended_spa: json.trial_ended_spa?.value || "",
                    trial_ended_zh: json.trial_ended_zh?.value || "",
                    trial_ended_ukr: json.trial_ended_ukr?.value || "",
                    trial_ended_pl: json.trial_ended_pl?.value || "",
                    trial_ended_cz: json.trial_ended_cz?.value || ""
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    async saveOptions() {
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/saveOptions", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": Cookies.get('token')
                },
                body: JSON.stringify(this.state.options)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            toast.success('Updated options');
        } catch (err) {
            toast.error('Couldn\'t update options');
        }
    }

    handleEmailChange(event) {
        const value = event.target.value;

        this.setState(state => ({
                ...state,
                options: {
                    ...state.options,
                    admin_email: value
                }
            })
        )
    }

    handleAllDecksPriceChange(event) {
        const value = event.target.value;

        this.setState(state => ({
                ...state,
                options: {
                    ...state.options,
                    decks_total_price: value
                }
            })
        )
    }

    async recompile() {
        const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/recompile", {
            method: "get",
            headers: {
                "x-access-token": Cookies.get('token')
            }
        });
        if (!response.ok) {
            throw Error(response.statusText);
        }
    }

    render() {
        return (
            <Card>
                <Title title="Welcome to admin panel"/>
                <MonthlyRevenue
                    icon={DollarIcon}
                    revenue={this.state.revenue}
                />
                <Button variant="contained"
                        color="primary"
                        size="large"
                        onClick={this.recompile}
                        style={{margin: "20px"}}
                >Recompile</Button>
                <form>
                    <label>
                        Admin Email:
                        <input type="email" name="admin_email" value={this.state.options.admin_email} onChange={ this.handleEmailChange } />
                    </label>
                    <br/>
                    <label>
                        All Decks Price:
                        <input type="text" name="decks_total_price" value={this.state.options.decks_total_price} onChange={ this.handleAllDecksPriceChange } placeholder="10.00" />
                    </label>
                    <br/>
                    <label>Info (EN):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_en}
                            modules={this.state.enModules.getModules()}
                            onChange={ (value) => {if (!this.state.enModules.getModules().toolbar.html) {this.setState(state => ({
                                ...state,
                                options: {
                                    ...state.options,
                                    interface_info_en: value
                                }
                            }
                        ))}}} />
                        <textarea value={this.state.options.interface_info_en} onChange={ (e) => {
                            if (this.state.enModules.getModules().toolbar.html) {
                            e.persist();
                            this.setState(state => ({
                                ...state,
                                options: {
                                    ...state.options,
                                    interface_info_en: e.target.value
                                }
                            })
                        )}}} />
                    </div>
                    <br/>
                    <label>Info (IL):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_il}
                                    modules={this.state.ilModules.getModules()}
                                    onChange={ (value) => {if (!this.state.ilModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_il: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_il} onChange={ (e) => {
                            if (this.state.ilModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_il: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Info (SPA):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_spa}
                                    modules={this.state.spaModules.getModules()}
                                    onChange={ (value) => {if (!this.state.spaModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_spa: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_spa} onChange={ (e) => {
                            if (this.state.spaModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_spa: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Info (ZH):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_zh}
                                    modules={this.state.zhModules.getModules()}
                                    onChange={ (value) => {if (!this.state.zhModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_zh: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_zh} onChange={ (e) => {
                            if (this.state.zhModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_zh: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Info (UKR):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_ukr}
                                    modules={this.state.ukrModules.getModules()}
                                    onChange={ (value) => {if (!this.state.ukrModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_ukr: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_ukr} onChange={ (e) => {
                            if (this.state.ukrModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_ukr: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Info (PL):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_pl}
                                    modules={this.state.plModules.getModules()}
                                    onChange={ (value) => {if (!this.state.plModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_pl: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_pl} onChange={ (e) => {
                            if (this.state.plModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_pl: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Info (CZ):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.interface_info_cz}
                                    modules={this.state.czModules.getModules()}
                                    onChange={ (value) => {if (!this.state.czModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                interface_info_cz: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.interface_info_cz} onChange={ (e) => {
                            if (this.state.czModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            interface_info_cz: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <label>Trial Ended Text (EN):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_en}
                                    modules={this.state.enTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.enTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_en: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_en} onChange={ (e) => {
                            if (this.state.enTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_en: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (IL):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_il}
                                    modules={this.state.ilTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.ilTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_il: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_il} onChange={ (e) => {
                            if (this.state.ilTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_il: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (SPA):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_spa}
                                    modules={this.state.spaTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.spaTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_spa: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_spa} onChange={ (e) => {
                            if (this.state.spaTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_spa: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (ZH):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_zh}
                                    modules={this.state.zhTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.zhTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_zh: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_zh} onChange={ (e) => {
                            if (this.state.zhTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_zh: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (UKR):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_ukr}
                                    modules={this.state.ukrTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.ukrTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_ukr: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_ukr} onChange={ (e) => {
                            if (this.state.ukrTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_ukr: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (PL):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_pl}
                                    modules={this.state.plTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.plTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_pl: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_pl} onChange={ (e) => {
                            if (this.state.plTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_pl: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <label>Trial Ended Text (CZ):</label>
                    <div className="quill_wrapper showSource">
                        <ReactQuill value={this.state.options.trial_ended_cz}
                                    modules={this.state.czTrialModules.getModules()}
                                    onChange={ (value) => {if (!this.state.czTrialModules.getModules().toolbar.html) {this.setState(state => ({
                                            ...state,
                                            options: {
                                                ...state.options,
                                                trial_ended_cz: value
                                            }
                                        }
                                    ))}}} />
                        <textarea value={this.state.options.trial_ended_cz} onChange={ (e) => {
                            if (this.state.czTrialModules.getModules().toolbar.html) {
                                e.persist();
                                this.setState(state => ({
                                        ...state,
                                        options: {
                                            ...state.options,
                                            trial_ended_cz: e.target.value
                                        }
                                    })
                                )}}} />
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={this.saveOptions}
                    >
                        Save
                    </Button>
                </form>
            </Card>
        );
    }

}

export default Dashboard;
