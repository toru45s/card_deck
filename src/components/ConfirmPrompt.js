import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

class ConfirmPrompt extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
    }

    handleClose() {
        this.props.onClose();
    }

    handleConfirm() {
        this.handleClose();
        this.props.onConfirm();
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{zIndex: 10003}}
            >
                <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleConfirm} color="primary" autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default ConfirmPrompt;
