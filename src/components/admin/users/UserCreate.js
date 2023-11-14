import React, { Component } from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';

class UserCreate extends Component {
    render() {
        return (
            <Create {...this.props} undoable={false}>
                <SimpleForm>
                    <TextInput source="email" />
                    <TextInput source="username" />
                    <TextInput source="password" type="password" />
                    <ReferenceInput label="Role" source="role" reference="roles">
                        <SelectInput optionText="name" />
                    </ReferenceInput>
                </SimpleForm>
            </Create>
        );
    }
}

export default UserCreate;