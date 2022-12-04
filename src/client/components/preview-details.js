import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';

import useLabels from 'hooks/use-labels';
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
    datapoint: PropTypes.shape({
        map: PropTypes.func
    })
};


const PreviewDetails = ({sample, displayLabels = true}) => {
    const {ref, predictions, groundtruths} = useLabels(sample instanceof Object ? sample : {});

    return (
        <div ref={ref}>
            <RenderDatapoint datapoint={sample} />
            {
                displayLabels && predictions?.length ? (
                    <>
                        <Row className='mt-5 mb-1 bg-white'>
                            <h4>Predictions</h4>
                        </Row>
                        <Table
                            columns={Object.keys(predictions[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({
                                Header: k,
                                Cell: ({cell}) => <pre>{JSON.stringify(cell.row.original[k], null, 4)}</pre> // eslint-disable-line react/prop-types
                            }))}
                            data={predictions}
                        />
                    </>
                ) : null
            }
            {
                displayLabels && groundtruths?.length ? (
                    <>
                        <Row className='mt-5 mb-1 bg-white'>
                            <h4>Groundtruths</h4>
                        </Row>
                        <Table
                            columns={Object.keys(groundtruths[0]).filter((k) => !SKIPPED_KEYS.has(k)).map((k) => ({
                                Header: k,
                                Cell: ({cell}) => <pre>{JSON.stringify(cell.row.original[k], null, 4)}</pre> // eslint-disable-line react/prop-types
                            }))}
                            data={groundtruths}
                        />
                    </>
                ) : null
            }
        </div>
    );
};

PreviewDetails.propTypes = {
    sample: PropTypes.any,
    displayLabels: PropTypes.bool
};

export default PreviewDetails;
