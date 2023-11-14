import React, { Component } from 'react';
import { Create, SimpleForm, NumberInput, ImageInput, ImageField, ReferenceInput, SelectInput } from 'react-admin';
import { parse } from "query-string";

class BGCreate extends Component {
    render() {
        const deck_id = parse(this.props.location.search).deck_id;
        const redirect = deck_id ? `/decks/${deck_id}/2` : "/decks";

        return (
            <Create {...this.props}>
                <SimpleForm redirect={redirect}>
                    <ReferenceInput label="Deck" source="deck_id" initialValue={deck_id} reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <ReferenceInput label="Combo" allowEmpty={true} source="combo_id" reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <ImageInput source="image" multiple={true} accept="image/jpeg">
                        <ImageField source="src" title="title" />
                    </ImageInput>
                    <NumberInput label="Order" initialValue="1" source="order" />
                </SimpleForm>
            </Create>
        );
    }
}

export default BGCreate;
