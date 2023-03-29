import PropTypes from 'prop-types';
import {useState} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import {Col, Form, Row} from 'react-bootstrap';

import FilterInput from 'pages/common/filter-input';
import DatapointsViewer from 'components/datapoints-viewer';
import CountDatapoints from './count-datapoints';

const DataSelector = ({value = {}, onChange, emptyOnUnfiltered}) => {
    const {filters = []} = value;
    const [collapsedPreview, setCollapsedPreview] = useState(true);
    const unfilteredEmpty = emptyOnUnfiltered && filters.length === 0;

    return (
        <>
            <Row className='g-2'>
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
                        Total {unfilteredEmpty ? 0 : <CountDatapoints filters={filters} className='d-inline' />} datapoints&nbsp;
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
                            unfilteredEmpty ? null : <DatapointsViewer filters={filters} />
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
