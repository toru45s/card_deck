import React, { Component } from 'react';
import { List, Datagrid, TextField, EditButton, DeleteButton, ImageField, NumberField } from 'react-admin';

class DeckList extends Component {
    render() {
        return (
            <List {...this.props}>
                <Datagrid rowClick="edit">
                    <TextField source="_id"/>
                    <NumberField source="order" />
                    <ImageField source="image" title="Deck" />
                    <TextField source="name"/>
                    <TextField source="short_description_en"/>
                    <EditButton />
                    <DeleteButton undoable={false} />
                </Datagrid>
            </List>
        );
    }
}

export default DeckList;