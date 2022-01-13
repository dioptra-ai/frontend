import React from 'react';
import Button from 'react-bootstrap/Button';
import Pagination from './pagination';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import {IconNames} from '../constants';
import baseJSONClient from 'clients/base-json-client';

const IncidentRow = ({
    name = ' ',
    resolved = false,
    isMainRow = true
}) => {
    return (
        <div className={`py-4 d-flex align-items-center ${!isMainRow ? 'mx-4' : ''} incident-row`}>
            <label className='checkbox'>
                <input type='checkbox' />
                <span> </span>
            </label>
            <FontIcon
                className={`text-${resolved ? 'success' : 'warning'} mx-1`}
                icon={resolved ? IconNames.CHECK : IconNames.WARNING}
                size={20}
            />
            <span className={`flex-grow-1 mx-2 text-dark fs-6 ${isMainRow ? 'bold-text' : ''}`}>{name}</span>
            <Button
                className='text-white btn-incident p-0 fs-6'
                variant={resolved ? 'success' : 'warning'}
            >
                {resolved ? 'Resolved' : 'Open'}
            </Button>
            {!isMainRow && <div className='mx-2'/>}
        </div>
    );
};

IncidentRow.propTypes = {
    isMainRow: PropTypes.bool,
    name: PropTypes.string,
    resolved: PropTypes.bool
};

const Incidents = () => {
    const [incidents, setIncidents] = React.useState([]);

    React.useEffect(() => {
        baseJSONClient('/api/alerts/events/list').then((response) => {
            setIncidents(response.alert_events);
        });
    }, []);

    const handlePageChange = () => {
        // get incidents for incoming page
    };

    return (
        <div className='incidents'>
            <div className='header mb-3'>
                <p className='bold-text fs-3 text-dark'>Incidents</p>
                <Button className='text-white bold-text fs-6' variant='primary'>
                    RESOLVE
                </Button>
            </div>
            <div className='border rounded px-3'>
                <div className='table-row py-4 text-secondary bold-text'>
                    <div className='flex-grow-1'>
                        <label className='checkbox'>
                            <input type='checkbox' />
                            <span className='fs-6'>Incidents Name</span>
                        </label>
                    </div>
                </div>
                {incidents && incidents.map((incident, i) => (
                    <IncidentRow
                        key={i}
                        name={incident.message}
                        resolved={incident.resolved}
                    />
                ))}

            </div>
            <Pagination onPageChange={(page) => handlePageChange(page)} totalPages={2}/>
        </div>
    );
};

export default Incidents;
