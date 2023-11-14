import React, { Component } from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, ImageInput, ImageField, ReferenceInput, SelectInput } from 'react-admin';
import { parse } from "query-string";

class BGEdit extends Component {
    render() {

        const redirect = (basePath, id, data) => `/decks/${data.deck_id}/2`;

        return (
            <Edit {...this.props} undoable={false}>
                <SimpleForm redirect={redirect}>
                    <TextInput disabled label="Id" source="_id" />
                    <ReferenceInput label="Deck" source="deck_id" reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <ReferenceInput label="Combo" allowEmpty={true} source="combo_id" reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <ImageField source="image" title="title" />
                    <ImageInput source="image" accept="image/jpeg">
                        <ImageField source="image" title="title" />
                    </ImageInput>
                    <NumberInput label="Order" initialValue="1" source="order" />
                </SimpleForm>
            </Edit>
        );
    }
}

export default BGEdit;
