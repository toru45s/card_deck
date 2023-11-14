import React, { Component } from 'react';
import { Typography } from '@material-ui/core';

class MonthlyRevenue extends Component {

    render() {
        return (
            <div className="dashModule">
                <div className="infobox">
                    <Typography
                        color="textSecondary"
                    >
                        Monthly Revenue
                    </Typography>
                    <Typography variant="h5" component="h2">
                        ${this.props.revenue}
                    </Typography>
                </div>
            </div>
        );
    }

};

export default MonthlyRevenue;