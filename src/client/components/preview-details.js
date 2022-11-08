import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';

import useLabels from 'hooks/use-labels';
import Table from 'components/table';

const SKIPPED_KEYS = new Set(['feature_heatmap', 'embeddings', 'original_embeddings', 'logits']);

const PreviewDetails = ({sample}) => {
    const {ref, predictions, groundtruths} = useLabels(sample instanceof Object ? sample : {});

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
                    Object.entries(sample).filter(([k]) => !SKIPPED_KEYS.has(k)).map(([k, v], i) => (
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
                                <h4>Predictions</h4>
                            </Row>
                            <Table columns={Object.keys(predictions[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({Header: k, accessor: k}))} data={predictions}/>
                        </>
                    ) : null
                }
                {
                    groundtruths?.length ? (
                        <>
                            <Row className='mt-5 mb-1 bg-white'>
                                <h4>Groundtruths</h4>
                            </Row>
                            <Table columns={Object.keys(groundtruths[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({Header: k, accessor: k}))} data={groundtruths}/>
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
