import React, { Component } from 'react';
import { Create, SimpleForm, ReferenceInput, TextInput, SelectInput } from 'react-admin';

class UserCom extends Component {
    render() {
        return (
            <Create {...this.props} undoable={false}>
                <SimpleForm>
                    <TextInput source="message_en" />
                    <TextInput source="message_il" />
                    <TextInput source="message_spa" />
                    <TextInput source="message_zh" />
                    <TextInput source="message_ukr" />
                    <TextInput source="message_pl" />
                    <TextInput source="message_cz" />
                    <ReferenceInput label="Role" source="role" reference="roles">
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                </SimpleForm>
            </Create>
        );
    }
}

export default UserCom;
