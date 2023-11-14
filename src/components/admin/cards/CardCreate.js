import React, { Component } from 'react';
import {
    Create,
    SimpleForm,
    ImageInput,
    ImageField,
    ReferenceInput,
    SelectInput,
    Toolbar,
    SaveButton
} from 'react-admin';
import { parse } from "query-string";
import CardForm from "./CardForm";

class CardCreate extends Component {

    constructor(props) {
        super(props);
        this.state = {form: ""}
        this.transform = this.transform.bind(this);
    }

    transform(data) {
        return {
            ...data,
            form: this.state.form
        }
    }

    render() {
        const deck_id = parse(this.props.location.search).deck_id;
        const redirect = deck_id ? `/decks/${deck_id}/1` : "/decks";

        return (
            <Create {...this.props} transform={this.transform}>
                <SimpleForm redirect={redirect} toolbar={<Toolbar {...this.props}>
                    <SaveButton
                        label="Create"
                        redirect={redirect}
                        submitOnEnter={true}
                    />
                </Toolbar>}>
                    <ReferenceInput label="Deck" source="deck_id" initialValue={deck_id} reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <CardForm context={this} />
                    <ImageInput source="image" multiple={true} accept="image/jpeg">
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </SimpleForm>
            </Create>
        );
    }
}

export default CardCreate;
