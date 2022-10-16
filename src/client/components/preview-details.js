import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';

const PreviewDetails = ({sample}) => {

    if (React.isValidElement(sample)) {

        return sample;
    } else if (Array.isArray(sample)) {

        return (
            <Row className='g-1'>
                {
                    sample.map((v, i) => (
                        <Col key={i} xs={12} className={i % 2 ? 'my-1 py-1 bg-white-blue' : 'my-1 py-1 bg-white'} style={{borderBottom: '1px solid silver'}}><PreviewDetails sample={v}/></Col>
                    ))
                }
            </Row>
        );
    } else if (sample && typeof sample === 'object') {

        return (
            <>
                {
                    Object.entries(sample).map(([k, v], i) => (
                        <Row key={k} className={i % 2 ? 'my-1 bg-white-blue' : 'my-1 bg-white'}>
                            <Col xs={2} style={{borderRight: '1px solid silver'}}>{k}</Col>
                            <Col className='text-break'>
                                <PreviewDetails sample={v}/>
                            </Col>
                        </Row>
                    ))
                }
            </>
        );
    } else if (isUrl(sample)) {

        return (
            <a href={sample} target='_blank' rel='noreferrer'>{sample}&nbsp;<sup><FiExternalLink className='fs-7'/></sup></a>
        );
    } else return String(sample);
};

PreviewDetails.propTypes = {
    sample: PropTypes.any
};

export default PreviewDetails;
