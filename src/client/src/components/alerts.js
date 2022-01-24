import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import PropTypes from 'prop-types';
import Pagination from './pagination';
import {Link, useParams} from 'react-router-dom';
import useModal from '../customHooks/useModal';
import Modal from './modal';
import baseJSONClient from 'clients/base-json-client';
import BarLoader from 'react-spinners/BarLoader';

const Alert = ({name, onDelete, onEdit}) => {
    return (
        <div className='table-row py-4 text-dark'>
            <div className='col bold-text'>
                <span className='fs-6'>{name}</span>
            </div>
            <div className='col actions-cell'>
                <FontIcon
                    className='text-dark mx-2'
                    icon={IconNames.EDIT}
                    onClick={onEdit}
                    size={20}
                />
                <FontIcon
                    className='text-dark mx-2'
                    icon={IconNames.BIN}
                    onClick={onDelete}
                    size={20}
                />
            </div>
        </div>
    );
};

Alert.propTypes = {
    name: PropTypes.string,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func
};

const Alerts = ({alerts, refreshCallback, onDeleteRefreshCallback, loading}) => {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [deleteAlertModal, setDeleteAlertModal] = useModal(null);
    const {_id} = useParams();
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (deleteAlertModal !== null && deleteAlertModal === false) {
            refreshCallback(page);
        }
    }, [deleteAlertModal]);

    useEffect(() => {}, []);

    const closeModal = () => {
        setDeleteAlertModal(false);
    };

    const handleAlertDelete = () => {
        baseJSONClient(`/api/tasks/alerts/delete/${selectedAlert._id}`, {
            method: 'delete'
        }).then(() => {
            onDeleteRefreshCallback(page);
            setDeleteAlertModal(false);
        });
    };

    const handleAlertEdit = () => {
        // edit alert
    };

    return (
        <>
            <div className='alerts'>
                <div className='header mb-3'>
                    <p className='bold-text fs-3 text-dark'>Alerts</p>
                    <Link to={`/${_id}/add-alert`}>
                        <Button
                            className='text-white bold-text fs-6'
                            variant='primary'
                        >
                            <FontIcon className='text-white' icon='Plus' size={10} />
                            ADD ALERT
                        </Button>
                    </Link>
                </div>
                <div className='border rounded px-3'>
                    <div className='table-row py-4 text-secondary bold-text'>
                        <div className='col'>
                            <label className='checkbox'>
                                <span className='fs-6'>Alert Name</span>
                            </label>
                        </div>
                        <div className='actions-cell fs-6 col'>Action</div>
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
                    {alerts.data &&
                        alerts.data.map((alert) => (
                            <Alert
                                key={alert._id}
                                name={alert.name}
                                onDelete={() => {
                                    setSelectedAlert(alert);
                                    setDeleteAlertModal(true);
                                }}
                                onEdit={handleAlertEdit}
                            />
                        ))}
                </div>
                <Pagination
                    onPageChange={(page) => {
                        setPage(page);
                        refreshCallback(page);
                    }}
                    totalPages={alerts.total_pages}
                    overrideSelectedPage={page}
                />
            </div>
            <Modal isOpen={deleteAlertModal} onClose={() => closeModal()}>
                <p className='text-dark bold-text fs-4 my-5 px-3 text-center'>
                    Are you sure you want do delete {selectedAlert?.name} alert?
                </p>
                <div className='d-flex justify-content-center border-top pt-4'>
                    <Button
                        className='text-white mx-2 py-2 px-5 bold-text fs-6'
                        onClick={() => handleAlertDelete()}
                        variant='primary'
                    >
                        DELETE
                    </Button>
                    <Button
                        className='text-secondary mx-2 py-2 px-5 bold-text fs-6'
                        onClick={() => setDeleteAlertModal(false)}
                        variant='light'
                    >
                        CANCEL
                    </Button>
                </div>
            </Modal>
        </>
    );
};

Alerts.propTypes = {
    alerts: PropTypes.object,
    refreshCallback: PropTypes.func,
    onDeleteRefreshCallback: PropTypes.func,
    loading: PropTypes.bool
};

export default Alerts;
