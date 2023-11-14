import React, { Component } from 'react';
import { Create, SimpleForm, TextInput, NumberInput, ImageInput, ImageField, CheckboxGroupInput } from 'react-admin';
import RichTextInput from 'ra-input-rich-text';

class DeckCreate extends Component {
    render() {
        return (
            <Create {...this.props} undoable="false">
                <SimpleForm>
                    <NumberInput source="order" min="1" />
                    <TextInput source="name" />
                    <CheckboxGroupInput source="forms" label="" optionValue="id" choices={[
                        {id: true, name: 'Deck with forms?'}
                    ]}/>
                    <ImageInput source="image" label="Back" accept="image/jpeg">
                        <ImageField source="image" title="title" />
                    </ImageInput>
                    <NumberInput source="price" label="Price per month" />
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
                    <TextInput source="languages" helperText="Comma separated string (e.g. en,il,spa,zh)" />
                </SimpleForm>
            </Create>
        );
    }
}

export default DeckCreate;
