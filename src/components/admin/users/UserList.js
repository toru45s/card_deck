import React, { Component } from 'react';
import { List, Datagrid, ReferenceField, TextField, EmailField, Filter, TextInput, EditButton, DeleteButton } from 'react-admin';

class UserList extends Component {
    render() {
        const UserFilter = (props) => (
            <Filter {...props}>
                <TextInput label="Search" source="username" alwaysOn />
            </Filter>
        );
        return (
            <List {...this.props} filters={<UserFilter />}>
                <Datagrid rowClick="edit">
                    <TextField source="_id"/>
                    <TextField source="email"/>
                    <TextField source="username"/>
                    <ReferenceField label="Role" link={false} source="role" reference="roles">
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="language"/>
                    <EditButton />
                    <DeleteButton undoable={false} />
                </Datagrid>
            </List>
        );
    }
}

export default UserList;