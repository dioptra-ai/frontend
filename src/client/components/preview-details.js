import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUrl from 'is-url';
import {FiExternalLink} from 'react-icons/fi';
import {IoChevronDownSharp, IoChevronUpSharp} from 'react-icons/io5';

import Table from 'components/table';

const SKIPPED_KEYS = new Set(['feature_heatmap', 'embeddings', 'original_embeddings', 'logits']);

const getDatapointMaxDepth = (datapoint) => {
    if (React.isValidElement(datapoint)) {

        return 0;
    } else if (Array.isArray(datapoint)) {

        return Math.max(...datapoint.map((v) => getDatapointMaxDepth(v)));
    } else if (datapoint && typeof datapoint === 'object') {

        return 1 + getDatapointMaxDepth(Object.values(datapoint));
    } else return 0;
};

export const RenderDatapoint = ({datapoint, parentIndex = 0}) => {
    const [collapsed, setCollapsed] = React.useState(true);

    if (React.isValidElement(datapoint)) {

        return datapoint;
    } else if (Array.isArray(datapoint)) {

        return (
            <div>
                {datapoint.length ? (
                    <div>
                        <a href='#' onClick={() => setCollapsed(!collapsed)}>
                            {datapoint.length} items {collapsed ? <IoChevronDownSharp /> : <IoChevronUpSharp />}
                        </a>
                    </div>
                ) : (
                    <div><i className='text-muted'>{'<empty list>'}</i></div>
                )}
                {collapsed ? null :
                    datapoint.map((v, i) => (
                        <div key={i} className={(parentIndex + i) % 2 ? ' bg-white-blue' : ' bg-white'} style={{
                            borderBottom: i !== datapoint.length - 1 ? '1px solid silver' : 'none'
                        }}>
                            <RenderDatapoint datapoint={v} parentIndex={parentIndex + i} />
                        </div>
                    ))
                }
            </div>
        );
    } else if (datapoint && typeof datapoint === 'object') {
        const depth = getDatapointMaxDepth(datapoint);
        const keyWidth = Math.max(Math.round(12 / (depth + 1)), 1);

        return (
            <>
                {
                    Object.entries(datapoint).filter(([k]) => !SKIPPED_KEYS.has(k)).map(([k, v], i) => (
                        <Row key={k} className={(parentIndex + i) % 2 ? 'bg-white-blue py-1' : 'bg-white py-1'}>
                            <Col style={{borderRight: '1px solid silver'}} xs={keyWidth}>{k}</Col>
                            <Col className='text-break'>
                                <RenderDatapoint datapoint={v} parentIndex={parentIndex + i} />
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
    datapoint: PropTypes.any.isRequired,
    parentIndex: PropTypes.number
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
