import React, { Component } from 'react';
import { Edit, SimpleForm, TextInput, ImageInput, ImageField, ReferenceInput, SelectInput, Toolbar, SaveButton } from 'react-admin';
import CardForm from './CardForm';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/table.min.js';



class CardEdit extends Component {

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
        const redirect = (basePath, id, data) => `/decks/${data.deck_id}/1`;

        return (
            <Edit {...this.props} undoable={false} transform={this.transform}>
                <SimpleForm redirect={redirect} toolbar={<Toolbar {...this.props}>
                        <SaveButton
                            label="Update"
                            redirect={redirect}
                            submitOnEnter={true}
                        />
                    </Toolbar>}>
                    <TextInput disabled label="Id" source="_id" />
                    <ReferenceInput label="Deck" source="deck_id" reference="decks" perPage={9999}>
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                    <CardForm context={this} />
                    <ImageField source="image" title="Card" />
                    <ImageInput source="image" accept="image/jpeg">
                        <ImageField source="image" title="title" />
                    </ImageInput>
                </SimpleForm>
            </Edit>
        );
    }
}

export default CardEdit;
