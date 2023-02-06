import PropTypes from 'prop-types';
import {Button, Col, Row} from 'react-bootstrap';
import {Link, useHistory, useParams} from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import Select from 'components/select';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import DataViewer from './data-viewer';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';

const DatasetVersionViewer = ({dataViewerProps, versionId}) => {
    // Defining histogram function to be used in the renderData assignment
    const getHistogram = (values, getClassName) => values.reduce((acc, value) => {
        const name = getClassName(value);

        if (name) {
            if (!acc[name]) {
                acc[name] = 0;
            }
            acc[name] += 1;
        }

        return acc;
    }, {});


    return (
        <Async
            fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}/datapoints`)}
            refetchOnChanged={[versionId]}
            renderData={(datapoints) => {
                const datapointIds = datapoints.map((datapoint) => datapoint['id']);

                return (
                    <>
                        <Async
                            fetchData={() => baseJSONClient('/api/groundtruths', {
                                method: 'post',
                                body: {datapointIds}
                            })}
                            refetchOnChanged={[datapointIds]}
                            renderData={(groundtruths) => {
                                const groundtruthsHist = getHistogram(groundtruths, (groundtruth) => groundtruth?.['class_name']);


                                return (
                                    <Async
                                        fetchData={() => baseJSONClient('/api/predictions', {
                                            method: 'post',
                                            body: {datapointIds}
                                        })}
                                        refetchOnChanged={[datapointIds]}
                                        renderData={(predictions) => {
                                            const predictionsHist = getHistogram(predictions, (prediction) => prediction?.['class_name']);

                                            return (
                                                <Row className='g-2 my-2'>
                                                    {
                                                        Object.keys(groundtruthsHist).length ? (
                                                            <Col>
                                                                <BarGraph
                                                                    title='Groundtruths'
                                                                    bars={Object.entries(groundtruthsHist).map(([name, value]) => ({
                                                                        name,
                                                                        value,
                                                                        fill: getHexColor(name)
                                                                    }))}
                                                                    yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                                />
                                                            </Col>
                                                        ) : null
                                                    }
                                                    {
                                                        Object.keys(predictionsHist).length ? (
                                                            <Col>
                                                                <BarGraph
                                                                    title='Predictions'
                                                                    bars={Object.entries(predictionsHist).map(([name, value]) => ({
                                                                        name,
                                                                        value,
                                                                        fill: getHexColor(name)
                                                                    }))}
                                                                    yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                                />
                                                            </Col>
                                                        ) : null
                                                    }
                                                </Row>
                                            );
                                        }}
                                    />
                                );
                            }}
                        />
                        <DataViewer datapointIds={datapointIds} {...dataViewerProps}/>
                    </>
                );
            }}
        />
    );
};

DatasetVersionViewer.propTypes = {
    versionId: PropTypes.string.isRequired,
    dataViewerProps: PropTypes.object
};

export {DatasetVersionViewer};

const DatasetVersion = () => {
    const {versionId} = useParams();
    const history = useHistory();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='bg-white-blue text-dark p-3'>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}`)}
                    refetchOnChanged={[versionId]}
                    renderData={(version) => (
                        <>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${version['dataset_uuid']}`)}
                                refetchOnChanged={[version['dataset_uuid']]}
                                renderData={(dataset) => (
                                    <h4 className='d-flex align-items-baseline'>
                                        <Link to={`/dataset/${dataset['uuid']}`}>{dataset['display_name']}</Link>
                                        &nbsp;
                                        <div className='fs-5'>version: <span style={{fontFamily: 'monospace'}}>{version['uuid']}</span></div>
                                    </h4>
                                )}
                            />
                            <div>Version commit message: <span style={{fontFamily: 'monospace'}}>{
                                version['committed'] ? `"${version['message']}"` : '<Uncommitted>'
                            }</span></div>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${version['dataset_uuid']}/versions`)}
                                refetchOnChanged={[version['dataset_uuid']]}
                                renderData={(versions) => (
                                    <Form className='my-2 d-flex' style={{width: 'fit-content'}} onSubmit={(e) => {
                                        e.preventDefault();
                                        const otherVersionId = e.target.versionId.value;

                                        history.push(`/dataset/diff/${otherVersionId}/${versionId}`);
                                    }}>
                                        <Form.Label column className='mb-0 text-nowrap'>Versions:</Form.Label>
                                        <Select name='versionId' className='ms-1 me-2' defaultValue={versionId}>
                                            {
                                                versions.map((version) => (
                                                    <option key={version['uuid']} value={version['uuid']}>
                                                        {version['committed'] ? `"${version['message']}"` : '<Uncommitted>'} ({new Date(version['created_at']).toLocaleString()})
                                                    </option>
                                                ))
                                            }
                                        </Select>
                                        <Button type='submit' variant='secondary' size='s' className='text-nowrap me-2'>{'->'} Diff</Button>
                                    </Form>
                                )}
                            />
                        </>
                    )}
                />
                <DatasetVersionViewer versionId={versionId}/>
            </div>
        </Menu>
    );
};

export default DatasetVersion;
