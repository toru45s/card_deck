import FroalaEditorComponent from "react-froala-wysiwyg";
import React from "react";

const CardForm = ({ record, context }) => {
    if (record && context) {
        return <div id="cardForm">
            <FroalaEditorComponent
                config={{
                    apiKey: process.env.REACT_APP_FROALA_KEY,
                    key: process.env.REACT_APP_FROALA_KEY,
                    attribution: false,
                    toolbarButtons: [['bold', 'italic'], ['alignLeft', 'alignCenter', 'alignRight'], ['insertImage', 'insertTable']],
                }}
                model={record.form}
                onModelChange={(form) => {
                    record.form = form;
                    return context.setState({form});
                }}
            />
        </div>;
    }
}

export default CardForm;
