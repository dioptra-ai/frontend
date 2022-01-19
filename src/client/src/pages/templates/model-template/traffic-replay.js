import {useState} from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import moment from 'moment';

import FilterInput from 'components/filter-input';
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import {setupComponent} from 'helpers/component-helper';
import Select from 'components/select';
import DateTimeRangePicker from 'components/date-time-range-picker';
import Async from 'components/async';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import CountEvents from 'components/count-events';

const TrafficReplay = ({filtersStore, timeStore}) => {
    const [endpoint, setEndpoint] = useState();
    const allSqlFilters = useAllSqlFilters({__REMOVE_ME__excludeOrgId: true});
    const model = useModel();

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-2 text-dark'>
                <div className='bold-text fs-3 my-3'>
                    Replay Events
                </div>
                <Form onSubmit={(e) => {
                    e.preventDefault();

                    baseJSONClient('/api/tasks/replays', {
                        method: 'post',
                        body: {
                            endpoint,
                            start_date_time_iso: timeStore.start.toISOString(),
                            end_date_time_iso: timeStore.end.toISOString(),
                            filters: filtersStore.filters,
                            ml_model_id: model.mlModelId
                        }
                    });
                }}>
                    <Form.Group as={Row} className='mb-3'>
                        <Col sm={3}>
                            Events to be replayed
                        </Col>
                        <Col>
                            <CountEvents sqlFilters={allSqlFilters}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Send to endpoint
                        </Form.Label>
                        <Col>
                            <Form.Control type='text' placeholder='https://example.com' required onChange={(e) => setEndpoint(e.target.value)}/>
                        </Col>
                    </Form.Group>
                    <Row>
                        <Col>
                            <Button type='submit' className='text-white'>START</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    );
};

export default setupComponent(TrafficReplay);