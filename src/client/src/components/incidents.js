import baseJSONClient from 'clients/base-json-client';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import {IconNames} from '../constants';
import FontIcon from './font-icon';
import Pagination from './pagination';

const IncidentRow = ({
    selectCallback,
    checked = false,
    id = '',
    name = ' ',
    resolved = false,
    isMainRow = true
}) => {
    return (
        <div
            className={`py-4 d-flex align-items-center ${
                !isMainRow ? 'mx-4' : ''
            } incident-row`}
        >
            {!resolved && (
                <label className='checkbox'>
                    <input
                        type='checkbox'
                        checked={checked}
                        onChange={(event) => {
                            selectCallback(id, event.target.checked);
                        }}
                    />
                    <span> </span>
                </label>
            )}
            <FontIcon
                className={`text-${resolved ? 'success' : 'warning'} mx-1`}
                icon={resolved ? IconNames.CHECK : IconNames.WARNING}
                size={20}
            />
            <span
                className={`flex-grow-1 mx-2 text-dark fs-6 ${
                    isMainRow ? 'bold-text' : ''
                }`}
            >
                {name}
            </span>
            <Button
                className='text-white btn-incident p-0 fs-6'
                variant={resolved ? 'success' : 'warning'}
            >
                {resolved ? 'Resolved' : 'Open'}
            </Button>
            {!isMainRow && <div className='mx-2' />}
        </div>
    );
};

IncidentRow.propTypes = {
    isMainRow: PropTypes.bool,
    name: PropTypes.string,
    resolved: PropTypes.bool,
    selectCallback: PropTypes.func,
    checked: PropTypes.bool,
    id: PropTypes.string
};

Incidents.propTypes = {
    incidents: PropTypes.array,
    refreshCallback: PropTypes.func
};

const Incidents = ({incidents, refreshCallback}) => {
    const [allEventsSelected, setAllEventsSelected] = useState(false);
    const [selectedEventIds, setSelectedEventIds] = useState([]);

    useEffect(() => {
        if (selectedEventIds.length !== 0) {
            setAllEventsSelected(
                JSON.stringify(selectedEventIds.sort()) ===
                    JSON.stringify(
                        incidents.map((incident) => incident.alert_id).sort()
                    )
            );
        } else {
            setAllEventsSelected(false);
        }
    }, [selectedEventIds]);

    const handlePageChange = () => {
        // get incidents for incoming page
    };

    const handleSelectEvent = (id, checked) => {
        if (checked) {
            setSelectedEventIds([...selectedEventIds, id]);
        } else {
            setSelectedEventIds(
                selectedEventIds.filter((eventId) => eventId !== id)
            );
        }
    };

    const handleSelectAllEvents = (checked) => {
        setSelectedEventIds(
            checked ? incidents.map((incident) => incident.alert_id) : []
        );
    };

    const handleResolveEvents = () => {
        baseJSONClient('/api/alerts/event/resolve', {
            method: 'post',
            body: {alert_ids: selectedEventIds}
        }).then((response) => {
            if (response.status === 200) {
                setAllEventsSelected(false);
                setSelectedEventIds([]);
                refreshCallback();
            }
        });
    };

    return (
        <div className='incidents'>
            <div className='header mb-3'>
                <p className='bold-text fs-3 text-dark'>Incidents</p>
                <Button
                    className='text-white bold-text fs-6'
                    variant='primary'
                    onClick={() => handleResolveEvents()}
                    disabled={selectedEventIds.length === 0}
                >
                    RESOLVE
                </Button>
            </div>
            <div className='border rounded px-3'>
                <div className='table-row py-4 text-secondary bold-text'>
                    <div className='flex-grow-1'>
                        <label className='checkbox'>
                            <input
                                type='checkbox'
                                checked={allEventsSelected}
                                onChange={(event) => handleSelectAllEvents(event.target.checked)
                                }
                            />
                            <span className='fs-6'>Incidents Name</span>
                        </label>
                    </div>
                </div>
                {incidents &&
                    incidents.map((incident, i) => (
                        <IncidentRow
                            selectCallback={handleSelectEvent}
                            checked={selectedEventIds.includes(incident.alert_id)}
                            id={incident.alert_id}
                            key={i}
                            name={incident.message}
                            resolved={incident.state === 'resolved'}
                        />
                    ))}
            </div>
            <Pagination
                onPageChange={(page) => handlePageChange(page)}
                totalPages={2}
            />
        </div>
    );
};

export default Incidents;
