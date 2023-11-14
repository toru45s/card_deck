import React, { Component } from 'react';
import {Edit, TextInput, SimpleForm, DateInput, ReferenceInput, SelectInput, required} from 'react-admin';
import { parse } from "query-string";

class UserDeckEdit extends Component {
    render() {
        const redirect = (basePath, id, data) => `/users/${data.user_id}/1`;

        return (
            <Edit {...this.props} undoable={false}>
                <SimpleForm redirect={redirect}>
                    <TextInput source="user_id" disabled />
                    <TextInput source="name" disabled label="Deck" />
                    <DateInput source="subscribedUntil" />
                </SimpleForm>
            </Edit>
        );
    }
}

export default UserDeckEdit;