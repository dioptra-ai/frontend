import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import {IconNames} from '../constants';

const Incident = ({
    name = ' ',
    resolved = false,
    border = true,
    fullwidth = true
}) => {
    return (
        <Row
            className={`py-3 d-flex align-items-center ${border ? 'border-bottom' : ''}`}
        >
            <Col
                className={`d-flex align-items-center ${fullwidth ? '' : 'm-auto'}`}
                lg={fullwidth ? 12 : 10}
            >
                <input className='mx-2' type='checkbox' />
                <FontIcon
                    className={`text-${resolved ? 'success' : 'warning'} mx-2`}
                    icon={resolved ? IconNames.CHECK : IconNames.WARNING}
                    size={20}
                />
                <span className='flex-fill mx-2'>{name}</span>
                <div className='mx-2 btn-wrapper'>
                    <Button
                        className='text-white w-100'
                        variant={resolved ? 'success' : 'warning'}
                    >
                        {resolved ? 'Resolved' : 'Open'}
                    </Button>
                </div>
            </Col>
        </Row>
    );
};

Incident.propTypes = {
    border: PropTypes.bool,
    fullwidth: PropTypes.bool,
    name: PropTypes.string,
    resolved: PropTypes.bool
};

export default Incident;
