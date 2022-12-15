import baseJSONClient from 'clients/base-json-client';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import {Link} from 'react-router-dom';
import {IconNames} from '../constants';
import useModal from '../hooks/useModal';
import FontIcon from './font-icon';
import Modal from './modal';
import Pagination from './pagination';

const Alert = ({id, name, onDelete}) => {
    return (
        <div className='table-row py-4 text-dark'>
            <div className='col bold-text'>
                <span className='fs-6'>{name}</span>
            </div>
            <div className='col actions-cell'>
                <Link to={`/models/edit-alert/${id}`}
                    style={{textDecoration: 'none'}}
                >
                    <FontIcon
                        className='text-dark mx-2'
                        icon={IconNames.EDIT}
                        size={20}
                    />
                </Link>

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
    id: PropTypes.string,
    name: PropTypes.string,
    onDelete: PropTypes.func
};

const Alerts = ({alerts, onPageChange, onDeleteRefreshCallback}) => {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [deleteAlertModal, setDeleteAlertModal] = useModal(false);
    const [page, setPage] = useState(0);

    const closeModal = () => {
        setDeleteAlertModal(false);
    };

    const handleAlertDelete = () => {
        baseJSONClient(`/api/tasks/alert?id=${selectedAlert._id}`, {
            method: 'delete'
        }).then(() => {
            onDeleteRefreshCallback();
            setDeleteAlertModal(false);
        });
    };

    return (
        <>
            <div className='alerts'>
                <div className='header mb-3'>
                    <p className='bold-text fs-3 text-dark'>Alerts</p>
                    <a>
                        <Button
                            className='text-white bold-text fs-6'
                            variant='primary'
                        >
                            <FontIcon className='text-white' icon='Plus' size={10} />
                            ADD ALERT
                        </Button>
                    </a>
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
                    {alerts.data?.map((alert) => (
                        <Alert
                            key={alert._id}
                            id={alert._id}
                            name={alert.name}
                            onDelete={() => {
                                setSelectedAlert(alert);
                                setDeleteAlertModal(true);
                            }}
                        />
                    ))}
                </div>
                <Pagination
                    onPageChange={(page) => {
                        setPage(page);
                        onPageChange(page);
                    }}
                    totalPages={alerts.total_pages}
                    overrideSelectedPage={page}
                />
            </div>
            <Modal isOpen={deleteAlertModal} onClose={() => closeModal()}>
                <p className='text-dark bold-text fs-4 my-5 px-3 text-center'>
                    Are you sure you want do delete alert "{selectedAlert?.name}"?
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
    onPageChange: PropTypes.func,
    onDeleteRefreshCallback: PropTypes.func
};

export default Alerts;
