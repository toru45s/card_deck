import React, { Component } from 'react';
import {
    List,
    Edit,
    TabbedForm,
    TextInput,
    NumberInput,
    FormTab,
    ReferenceManyField,
    Datagrid,
    TextField,
    ImageField,
    NumberField,
    EditButton,
    DeleteButton,
    CreateButton,
    ImageInput,
    Toolbar,
    SaveButton,
    CheckboxGroupInput
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import { Link } from 'react-router-dom';

class DeckEdit extends Component {


    AddNewCardButton( deck ) {
        return(
            <CreateButton
                component={Link}
                to={{
                    pathname: "/cards/create",
                    search: `?deck_id=${deck.id}`,
                }}
                label="Add a card"
            >
            </CreateButton>
        );
    }

    AddNewBGButton( deck ) {
        return(
            <CreateButton
                component={Link}
                to={{
                    pathname: "/backgrounds/create",
                    search: `?deck_id=${deck.id}`,
                }}
                label="Add a background"
            >
            </CreateButton>
        );
    }

    render() {
        const DeckEditToolbar = props => (
            <Toolbar {...props}>
                <SaveButton />
            </Toolbar>
        );
        return (
            <Edit {...this.props} undoable={false} >
                <TabbedForm toolbar={<DeckEditToolbar />}>
                        <FormTab label="General">
                            <TextInput disabled label="Id" source="_id" />
                            <NumberInput source="order" min="1"/>
                            <TextInput source="name" />
                            <CheckboxGroupInput source="forms" label="" optionValue="id" choices={[
                                {id: true, name: 'Deck with forms?'}
                            ]}/>
                            <ImageField source="image" title="Back" />
                            <ImageInput source="image" label="Back" accept="image/jpeg">
                                <ImageField source="image" title="title" />
                            </ImageInput>
                            <NumberInput source="price" label="Price per month"/>
                            <NumberInput source="price_year" label="Price per year" />
                            <TextInput source="short_description_en" />
                            <TextInput source="short_description_il" />
                            <TextInput source="short_description_spa" />
                            <TextInput source="short_description_zh" />
                            <TextInput source="short_description_ukr" />
                            <TextInput source="short_description_pl" />
                            <TextInput source="short_description_cz" />
                            <RichTextInput source="description_en" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_il" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_spa" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_zh" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_ukr" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_pl" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <RichTextInput source="description_cz" toolbar={[ [{ 'header': 1 }, { 'header': 2 }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], [{ 'align': [] }], [{ 'direction': 'rtl' }] ]} />
                            <TextInput source="keywords" helperText="Comma separated string (e.g. Therapy,Games,Motivational)" />
                            <TextInput source="languages" helperText="Comma separated string (e.g. en,il,spa,zh,ukr,pl,cz)" />
                        </FormTab>
                        <FormTab label="Cards">
                            {this.AddNewCardButton(this.props)}
                            <ReferenceManyField
                                addLabel={false}
                                reference="cards"
                                target="id"
                                filter={{deck_id: this.props.id}}
                            >
                                <List {...this.props}>
                                    <Datagrid rowClick="edit">
                                        <TextField source="_id"/>
                                        <ImageField source="image"/>
                                        <EditButton />
                                        <DeleteButton undoable={false} redirect={false} />
                                    </Datagrid>
                                </List>
                            </ReferenceManyField>
                            {this.AddNewCardButton(this.props)}
                        </FormTab>
                        <FormTab label="Backgrounds">
                            <ReferenceManyField
                                addLabel={false}
                                reference="backgrounds"
                                target="id"
                                filter={{deck_id: this.props.id}}
                            >
                                <List {...this.props}>
                                    <Datagrid rowClick="edit">
                                        <TextField source="_id"/>
                                        <ImageField source="image"/>
                                        <NumberField source="order" />
                                        <EditButton />
                                        <DeleteButton undoable={false} redirect={false} />
                                    </Datagrid>
                                </List>
                            </ReferenceManyField>
                            {this.AddNewBGButton(this.props)}
                        </FormTab>
                </TabbedForm>
            </Edit>
        );
    }
}

export default DeckEdit;
