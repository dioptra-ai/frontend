import baseJSONClient from 'clients/base-json-client';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import {IconNames} from '../constants';
import useModal from '../customHooks/useModal';
import FontIcon from './font-icon';
import Modal from './modal';
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

const Incidents = ({incidents, refreshCallback}) => {
    const [allEventsSelected, setAllEventsSelected] = useState(false);
    const [selectedEventIds, setSelectedEventIds] = useState([]);
    const [resolveIncidentModal, setResolveIncidentModal] = useModal(false);

    useEffect(() => {
        if (selectedEventIds.length !== 0) {
            const openedIncedents = JSON.stringify(
                incidents
                    .filter((incident) => incident.state === 'open')
                    .map((incident) => incident.alert_id)
                    .sort()
            );

            setAllEventsSelected(
                JSON.stringify(selectedEventIds.sort()) === openedIncedents
            );
        } else {
            setAllEventsSelected(false);
        }
    }, [selectedEventIds, incidents]);

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
            checked ?
                incidents
                    .filter((incident) => incident.state === 'open')
                    .map((incident) => incident.alert_id) :
                []
        );
    };

    const handleResolveEvents = () => {
        baseJSONClient('/api/tasks/alerts/event/resolve', {
            method: 'post',
            body: {alert_ids: selectedEventIds}
        }).then(() => {
            setResolveIncidentModal(false);
            setAllEventsSelected(false);
            setSelectedEventIds([]);
            refreshCallback();
        });
    };

    return (
        <div className='incidents'>
            <div className='header mb-3'>
                <p className='bold-text fs-3 text-dark'>Incidents</p>
                <div className='d-flex gap-2'>
                    <Button
                        style={{width: 40}}
                        className='text-white bold-text'
                        variant='secondary'
                        onClick={() => refreshCallback(false)}
                    >
                        <FontIcon className='text-white' icon='Refresh' size={14} />
                    </Button>
                    <Button
                        className='text-white bold-text fs-6'
                        variant='primary'
                        onClick={() => setResolveIncidentModal(true)}
                        disabled={selectedEventIds.length === 0}
                    >
                        RESOLVE
                    </Button>
                </div>
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
            <Modal
                isOpen={resolveIncidentModal}
                onClose={() => setResolveIncidentModal(false)}
            >
                <p className='text-dark bold-text fs-4 my-5 px-3 text-center'>
                    Are you sure you want to resolve selected incidents?
                </p>
                <div className='d-flex justify-content-center border-top pt-4'>
                    <Button
                        className='text-white mx-2 py-2 px-5 bold-text fs-6'
                        onClick={() => handleResolveEvents()}
                        variant='primary'
                    >
                        RESOLVE
                    </Button>
                    <Button
                        className='text-secondary mx-2 py-2 px-5 bold-text fs-6'
                        onClick={() => setResolveIncidentModal(false)}
                        variant='light'
                    >
                        CANCEL
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

Incidents.propTypes = {
    incidents: PropTypes.array,
    refreshCallback: PropTypes.func
};

export default Incidents;
