import React, { Component } from 'react';
import { Typography } from '@material-ui/core';

class Connections extends Component {

    render() {
        return (
            <div className="dashModule">
                <div textAlign="right" className="infobox">
                    <Typography
                        color="textSecondary"
                    >
                        Max Connections
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {this.props.connections}
                    </Typography>
                </div>
            </div>
        );
    }

};

export default Connections;