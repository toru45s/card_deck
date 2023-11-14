import React, { Component } from 'react';
import { Create, TextInput, SimpleForm, DateInput, ReferenceInput, SelectInput, required } from 'react-admin';
import { parse } from "query-string";

class UserDeckCreate extends Component {
    render() {

        const user_id = parse(this.props.location.search).user_id;
        const redirect = `/users/${user_id}/1`;

        return (
            <Create {...this.props}>
                <SimpleForm redirect={redirect}>
                    <TextInput source="user_id" disabled initialValue={user_id} />
                    <ReferenceInput label="Deck" validate={[required()]} source="deck_id" reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <DateInput source="subscribedUntil" />
                </SimpleForm>
            </Create>
        );
    }
}

export default UserDeckCreate;
