import React from 'react';
import Button from 'react-bootstrap/Button';
import Pagination from './pagination';
import Expandable from './expandable';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import {IconNames} from '../constants';

const incidents = [
    {id: 0, name: 'Incident was caused by accuracy metric hitting the x% threshold', resolved: false, details: [{
        name: 'Feature Merchant Category Code is not within range', resolved: false
    },
    {
        name: 'Feature Transaction Amount online distribution doesn’t match its offline equivalent', resolved: false
    }]},
    {id: 1, name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', resolved: true, details: [{
        name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', resolved: true
    }]},
    {id: 2, name: 'Lorem ipsum dolor sit amet, consectetur unc congue volutpat sodales', resolved: true, details: [{
        name: 'Lorem ipsum dolor sit amet, consectetur unc congue volutpat sodales', resolved: true
    }]},
    {id: 3, name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit unc congue volutpat felis eget sodales congue volutpat felis eget sodales', resolved: true, details: [{
        name: 'Lorem ipsum dolor sit amet, consectetur unc congue volutpat sodales', resolved: true
    }]},
    {id: 4, name: 'Lorem ipsum dolor sit amet, unc congue volutpat felis eget sodales', resolved: true, details: [{
        name: 'Lorem ipsum dolor sit amet, consectetur unc congue volutpat sodales', resolved: true
    }]}
];

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
            <span className={`flex-grow-1 mx-2 text-dark ${isMainRow ? 'fw-bold' : ''}`}>{name}</span>
            <Button
                className='text-white btn-incident p-0'
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

    const handlePageChange = () => {
        // get incidents for incoming page
    };

    return (
        <div className='incidents'>
            <div className='header mb-3'>
                <p className='fw-bold text-dark'>Incidents</p>
                <Button className='text-white fw-bold' variant='primary'>
                    RESOLVE
                </Button>
            </div>
            <div className='border rounded px-3'>
                <div className='table-row py-4 text-secondary fw-bold'>
                    <div className='flex-grow-1'>
                        <label className='checkbox'>
                            <input type='checkbox' />
                            <span>Incidents Name</span>
                        </label>
                    </div>
                </div>
                {incidents.map((incident, i) => (
                    <Expandable content={ <IncidentRow
                        name={incident.name}
                        resolved={incident.resolved}
                    />} expandedContent={incident.details && incident.details.map((d, i) => (
                        <IncidentRow
                            isMainRow={false}
                            key={i}
                            name={d.name}
                            resolved={d.resolved}
                        />
                    ))} key={i}/>

                ))}

            </div>
            <Pagination onPageChange={(page) => handlePageChange(page)} totalPages={2}/>
        </div>
    );
};

export default Incidents;
