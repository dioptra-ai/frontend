import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';

import useLabels from 'hooks/use-labels';

const PreviewDetails = ({sample}) => {
    console.log(sample);
    const {ref, predictions, groundtruths} = useLabels(sample);

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
                        <Row key={k} className={i % 2 ? 'my-1 bg-white-blue' : 'my-1 bg-white'} ref={ref}>
                            <Col xs={2} style={{borderRight: '1px solid silver'}}>{k}</Col>
                            <Col className='text-break'>
                                <PreviewDetails sample={v}/>
                            </Col>
                        </Row>
                    ))
                }
                {
                    predictions?.length ? (
                        <>
                            <Row className='mt-5 mb-1 bg-white'>
                                <h3>Predictions</h3>
                            </Row>
                            <PreviewDetails sample={predictions}/>
                        </>
                    ) : null
                }
                {
                    groundtruths?.length ? (
                        <>
                            <Row className='mt-5 mb-1 bg-white'>
                                <h3>Groundtruths</h3>
                            </Row>
                            <PreviewDetails sample={groundtruths}/>
                        </>
                    ) : null
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
