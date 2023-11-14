import React, { Component } from 'react';
import { Edit, TabbedForm, FormTab, TextInput, ReferenceInput, SelectInput, FormDataConsumer, DateInput, ReferenceManyField, ChipField, EditButton, DeleteButton, Datagrid, CreateButton, Toolbar} from 'react-admin';
import {Link} from "react-router-dom";

class UserEdit extends Component {

    AddNewDeckButton( user ) {
        return(
            <CreateButton
                component={Link}
                to={{
                    pathname: "/userdeck/create",
                    search: `?user_id=${user.id}`,
                }}
                label="Attach a Deck"
            >
            </CreateButton>
        );
    }



    render() {

        const EditDeckButton = (props) => {
            if (typeof props.record === "undefined") {
                return false;
            }
            return (
                <EditButton component={Link}
                            to={{
                                pathname: `/userdeck/${props.record.id}`,
                                search: `?user_id=${this.props.id}`,
                            }}
                            label="Edit Deck"
                >
                </EditButton>
            )
        };

        return (
            <Edit {...this.props} undoable={false}>
                <TabbedForm>
                    <FormTab label="General">
                        <TextInput disabled label="Id" source="_id" />
                        <TextInput source="email" />
                        <TextInput source="username" />
                        <ReferenceInput label="Role" source="role" reference="roles">
                            <SelectInput optionText="name" />
                        </ReferenceInput>
                        <FormDataConsumer>
                            {({ formData, ...rest }) => formData.role === 1 &&
                                <DateInput source="trialUntil" {...rest} />
                            }
                        </FormDataConsumer>
                    </FormTab>
                    <FormTab label="Decks">
                        <ReferenceManyField
                            addLabel={false}
                            reference="userdeck"
                            target="id"
                            filter={{user_id: this.props.id}}
                        >
                            <Datagrid>
                                <ChipField source="name"/>
                                <Toolbar>
                                <EditDeckButton/>
                                <DeleteButton undoable={false} redirect={false} />
                                </Toolbar>
                            </Datagrid>
                        </ReferenceManyField>
                        {this.AddNewDeckButton(this.props)}
                    </FormTab>
                </TabbedForm>
            </Edit>
        );
    }
}

export default UserEdit;