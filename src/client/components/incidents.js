import baseJSONClient from 'clients/base-json-client';
import {formatDateTime} from 'helpers/date-helper';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import BarLoader from 'react-spinners/BarLoader';
import {IconNames} from '../constants';
import useModal from '../hooks/useModal';
import FontIcon from './font-icon';
import Modal from './modal';
import Pagination from './pagination';

const IncidentRow = ({
    selectCallback,
    checked = false,
    id = '',
    message = '',
    creationDate = '',
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
                        style={{cursor: 'pointer'}}
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
                {message} Date: {formatDateTime(moment(creationDate))}
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
    message: PropTypes.string,
    resolved: PropTypes.bool,
    creationDate: PropTypes.string,
    selectCallback: PropTypes.func,
    checked: PropTypes.bool,
    id: PropTypes.string
};

const Incidents = ({incidents, refreshCallback, loading}) => {
    const [allEventsSelected, setAllEventsSelected] = useState(false);
    const [selectedEventIds, setSelectedEventIds] = useState([]);
    const [resolvingInProgress, setResolvingInProgress] = useState(false);
    const [resolveIncidentModal, setResolveIncidentModal] = useModal(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (selectedEventIds.length !== 0) {
            const openedIncedents = JSON.stringify(
                incidents.data
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
                incidents.data
                    .filter((incident) => incident.state === 'open')
                    .map((incident) => incident.alert_id) :
                []
        );
    };

    const handleResolveEvents = () => {
        setResolvingInProgress(true);
        baseJSONClient('/api/tasks/alert/event/resolve', {
            method: 'post',
            body: {alert_ids: selectedEventIds}
        }).then(() => {
            setResolvingInProgress(false);
            setResolveIncidentModal(false);
            setAllEventsSelected(false);
            setSelectedEventIds([]);
            refreshCallback(page);
        });
    };

    return (
        <div className='incidents'>
            <div className='header mb-3'>
                <p className='bold-text fs-3 text-dark'>Incidents</p>
                <div className='d-flex justify-content-center align-items-center align-content-center gap-4'>
                    <FontIcon
                        disabled={loading}
                        className='text-dark'
                        icon={IconNames.REFRESH}
                        onClick={() => refreshCallback(page)}
                        size={20}
                    />
                    <Button
                        className='bold-text fs-6'
                        variant='outline-secondary'
                        onClick={() => setResolveIncidentModal(true)}
                        disabled={
                            selectedEventIds.length === 0 || resolvingInProgress
                        }
                    >
                        RESOLVE
                    </Button>
                </div>
            </div>
            <div className='border rounded px-3'>
                <div className='table-row py-4 text-secondary bold-text'>
                    <div className='flex-grow-1'>
                        <label className='checkbox'>
                            {incidents.data?.filter(
                                (incident) => incident.state === 'open'
                            ).length !== 0 && (
                                <input
                                    type='checkbox'
                                    checked={allEventsSelected}
                                    onChange={(event) => handleSelectAllEvents(event.target.checked)
                                    }
                                />
                            )}
                            <span className='fs-6'>Incidents Message</span>
                        </label>
                    </div>
                </div>
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    <BarLoader loading={loading} size={150} />
                </div>
                {incidents.data?.map((incident, i) => (
                    <IncidentRow
                        selectCallback={handleSelectEvent}
                        checked={selectedEventIds.includes(incident.alert_id)}
                        id={incident.alert_id}
                        key={i}
                        message={incident.message}
                        creationDate={incident.__time}
                        resolved={incident.state === 'resolved'}
                    />
                ))}
            </div>
            <Pagination
                onPageChange={(page) => {
                    setPage(page);
                    refreshCallback(page);
                }}
                totalPages={incidents.total_pages}
                overrideSelectedPage={page}
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
    incidents: PropTypes.object,
    refreshCallback: PropTypes.func,
    loading: PropTypes.bool
};

export default Incidents;
