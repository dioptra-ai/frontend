import PropTypes from 'prop-types';
import {useState} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import {Col, Form, Row} from 'react-bootstrap';

import FilterInput from 'pages/common/filter-input';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import DatapointsViewer from './datapoints-viewer';
import CountEvents from './count-events';

const DataSelector = ({value = {}, onChange, emptyOnUnfiltered}) => {
    const {filters = [], limit = 12} = value;
    const [collapsedPreview, setCollapsedPreview] = useState(true);
    const unfilteredEmpty = emptyOnUnfiltered && filters.length === 0;

    return (
        <>
            <Row classname='g-2'>
                <Col>
                    <InputGroup className='mt-1 d-flex flex-column'>
                        <FilterInput onChange={(filters) => onChange({
                            ...value,
                            filters
                        })} value={filters} />
                    </InputGroup>
                </Col>
            </Row>
            <Row className='g-2 mb-2'>
                <Col>
                    <Form.Text className='text-muted'>
                        Total {unfilteredEmpty ? 0 : <CountEvents filters={filters} className='d-inline' />} datapoints&nbsp;
                    </Form.Text>
                    <Form.Text className='text-muted cursor-pointer text-decoration-underline' onClick={() => setCollapsedPreview(!collapsedPreview)}>
                        ({collapsedPreview ? 'Preview' : 'Hide Preview'})
                    </Form.Text>
                </Col>
            </Row>
            {collapsedPreview ? null : (
                <Row className='g-2'>
                    <Col>
                        {
                            unfilteredEmpty ? null : (
                                <Async
                                    fetchData={() => metricsClient('select', {
                                        select: '"timestamp", "uuid", "request_id", "image_metadata", "text_metadata", "video_metadata","text", "tags"',
                                        filters,
                                        limit
                                    })}
                                    refetchOnChanged={[filters]}
                                    renderData={(data) => (
                                        <DatapointsViewer datapoints={data} />
                                    )}
                                />
                            )
                        }
                    </Col>
                </Row>
            )}
        </>
    );
};

DataSelector.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.shape({
        filters: PropTypes.array,
        limit: PropTypes.number
    }),
    emptyOnUnfiltered: PropTypes.bool
};

export default DataSelector;
