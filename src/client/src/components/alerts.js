import Button from 'react-bootstrap/Button';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import Pagination from './pagination';
import {Link} from 'react-router-dom';
import {Paths} from 'configs/route-config';

const alerts = [
    {name: 'Alert logic available here', notify: 'PagerDuty'},
    {name: 'Alert logic available here', notify: 'PagerDuty'},
    {name: 'Alert logic available here', notify: 'Email'},
    {name: 'Alert logic available here', notify: 'Slack'},
    {name: 'Alert logic available here', notify: ''},
    {name: 'Alert logic available here', notify: 'Slack'},
    {name: 'Alert logic available here', notify: 'Email'},
    {name: 'Alert logic available here', notify: ''},
    {name: 'Alert logic available here', notify: 'PagerDuty'},
    {name: 'Alert logic available here', notify: 'Slack'}
];

const Alert = ({name, notifyBy, onDelete, onEdit}) => {
    return (
        <div className='table-row py-4 text-dark'>
            <div className='fw-bold'>
                <label className='checkbox'>
                    <input type='checkbox' />
                    <span>{name}</span>
                </label>
            </div>
            <div>{notifyBy ? notifyBy : '-'}</div>
            <div className='actions-cell'>
                <FontIcon className='text-dark mx-2' icon='Edit' onClick={onEdit} size={20}/>
                <FontIcon className='text-dark mx-2' icon='Bin' onClick={onDelete} size={20}/>
            </div>
        </div>
    );
};

Alert.propTypes = {
    name: PropTypes.string,
    notifyBy: PropTypes.string,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func
};
const Alerts = () => {
    const handleAlertDelete = () => {
        // delete alert
    };

    const handleAlertEdit = () => {
        // edit alert
    };

    const handlePageChange = () => {
        // get alerts for incoming page
    };

    return (
        <div className='alerts'>
            <div className='header py-3'>
                <p className='fw-bold text-dark'>Alerts</p>
                <Link to={Paths().ADD_ALERT}>
                    <Button className='text-white fw-bold' variant='primary'>
                        <FontIcon className='text-white' icon='Plus' size={10}/>
                    ADD ALERT
                    </Button>
                </Link>
            </div>
            <div className='border rounded px-3'>
                <div className='table-row py-4 text-secondary fw-bold'>
                    <div>
                        <label className='checkbox'>
                            <input type='checkbox' />
                            <span>Alert Name</span>
                        </label>
                    </div>
                    <div>Notifications via</div>
                    <div className='actions-cell'>Action</div>
                </div>
                {alerts.map((alert, i) => (
                    <Alert key={i} name={alert.name} notifyBy={alert.notify} onDelete={handleAlertDelete} onEdit={handleAlertEdit}/>
                ))}

            </div>
            <Pagination onPageChange={(page) => handlePageChange(page)} totalPages={8}/>
        </div>
    );
};

export default Alerts;
