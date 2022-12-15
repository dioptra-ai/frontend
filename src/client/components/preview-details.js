import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';

import Table from 'components/table';

const SKIPPED_KEYS = new Set(['feature_heatmap', 'embeddings', 'original_embeddings', 'logits']);

const RenderDatapoint = ({datapoint}) => {

    if (React.isValidElement(datapoint)) {

        return datapoint;
    } else if (Array.isArray(datapoint)) {

        return (
            <Row className='g-1'>
                {
                    datapoint.map((v, i) => (
                        <Col key={i} xs={12} className={i % 2 ? 'my-1 py-1 bg-white-blue' : 'my-1 py-1 bg-white'} style={{borderBottom: '1px solid silver'}}><RenderDatapoint datapoint={v} /></Col>
                    ))
                }
            </Row>
        );
    } else if (datapoint && typeof datapoint === 'object') {

        return (
            <>
                {
                    Object.entries(datapoint).filter(([k]) => !SKIPPED_KEYS.has(k)).map(([k, v], i) => (
                        <Row key={k} className={i % 2 ? 'my-1 bg-white-blue' : 'my-1 bg-white'}>
                            <Col style={{borderRight: '1px solid silver'}}>{k}</Col>
                            <Col className='text-break'>
                                <RenderDatapoint datapoint={v} />
                            </Col>
                        </Row>
                    ))
                }
            </>
        );
    } else if (isUrl(datapoint)) {

        return (
            <a href={datapoint} target='_blank' rel='noreferrer'>{datapoint}&nbsp;<sup><FiExternalLink className='fs-7' /></sup></a>
        );
    } else return String(datapoint);
};

RenderDatapoint.propTypes = {
    datapoint: PropTypes.any.isRequired
};

const PreviewDetails = ({datapoint, labels, displayDetails, ...rest}) => {
    const predictions = labels?.map((l) => l['prediction']).filter(Boolean);
    const groundtruths = labels?.map((l) => l['groundtruth']).filter(Boolean);
    const displayLabelsFoDatapoint = displayDetails && !datapoint.prediction && !datapoint.groundtruth;

    return (
        <div {...rest}>
            <RenderDatapoint datapoint={datapoint} />
            {
                displayLabelsFoDatapoint ? (
                    <>
                        <Row className='mt-5 mb-1 bg-white'>
                            <h4>Predictions</h4>
                        </Row>
                        <Table
                            columns={predictions?.length ? Object.keys(predictions[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({
                                Header: k,
                                Cell: ({cell}) => <pre>{JSON.stringify(cell.row.original[k], null, 4)}</pre> // eslint-disable-line react/prop-types
                            })) : []}
                            data={predictions}
                        />
                    </>
                ) : null
            }
            {
                displayLabelsFoDatapoint ? (
                    <>
                        <Row className='mt-5 mb-1 bg-white'>
                            <h4>Groundtruths</h4>
                        </Row>
                        <Table
                            columns={groundtruths?.length ? Object.keys(groundtruths[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({
                                Header: k,
                                Cell: ({cell}) => <pre>{JSON.stringify(cell.row.original[k], null, 4)}</pre> // eslint-disable-line react/prop-types
                            })) : []}
                            data={groundtruths}
                        />
                    </>
                ) : null
            }
        </div>
    );
};

PreviewDetails.propTypes = {
    datapoint: PropTypes.object,
    labels: PropTypes.array,
    displayDetails: PropTypes.bool
};

export default PreviewDetails;
