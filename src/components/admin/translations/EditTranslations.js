import React, { Component } from 'react';
import { TabbedForm, FormTab } from 'react-admin';
import Ajv from "ajv";
import ace from "brace";
import "brace/mode/json";
import "brace/theme/github";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import {toast} from "react-toastify";
import {MainContext} from "../../../Context";
import Cookies from "js-cookie";

class EditTranslations extends Component {

    static contextType = MainContext;

    constructor(props) {
        super(props);

        this.state = {translations: []};
        this.tabs = this.tabs.bind(this);
    }

    async componentDidMount() {
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getTranslations", {
                headers: {
                    "x-access-token": Cookies.get('token')
                }
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            this.setState({ translations: json });
        } catch (err) {
            toast.error('Couldn\'t fetch translation files');
        }
    }

    tabs() {
        const renderedTabs = this.state.translations.map(function (lang) {
            return this.renderTab(lang);
        }, this);

        return renderedTabs;
    }

    async submit(lang) {
        const saveLang = this.state.translations.find(x => x.lang === lang);
        try {
            const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/updateTranslations", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": Cookies.get('token')
                },
                body: JSON.stringify(saveLang)
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const json = await response.json();

            toast.success('Translations updated');
        } catch (err) {
            toast.error('Couldn\'t update translation files');
        }
    }

    onChange(data, lang) {
        const index = this.state.translations.findIndex(x => x.lang === lang);
        const updatedTranslations = this.state.translations;
        updatedTranslations[index] = {lang: lang, file: data};
        this.setState({ translations: updatedTranslations });
    }

    renderTab(lang) {
        const ajv = new Ajv({ allErrors: true, verbose: true });

        return (
            <FormTab label={lang.lang}>

                <Editor
                    id='lang'
                    value={lang.file}
                    onChange={(data) => { this.onChange(data, lang.lang) }}
                    ace={ace}
                    ajv={ajv}
                    theme="ace/theme/github"
                />
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={() => { this.submit(lang.lang) }}
                >
                    Save
                </Button>
            </FormTab>
        );
    }

    render() {
        return (
            <TabbedForm toolbar="">
                {this.tabs()}
            </TabbedForm>
        );
    }
}

export default EditTranslations;
