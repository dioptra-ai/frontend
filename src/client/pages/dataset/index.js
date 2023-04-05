import {useState} from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';
import {Button, Container} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import LoadingForm from 'components/loading-form';
import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';
import {DatasetCommitModal, DatasetEditModal} from 'components/dataset-modal';
import Select from 'components/select';
import {DatasetVersionViewer} from './dataset-version';

const Dataset = () => {
    const {datasetId} = useParams();
    const history = useHistory();
    const [isDatasetEditOpen, setIsDatasetEditOpen] = useState(false);
    const [isDatasetCommitOpen, setIsDatasetCommitVersionOpen] = useState(false);
    const [lastUpdatedOn, setLastUpdatedOn] = useState(new Date());

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/dataset/${datasetId}`)}
                refetchOnChanged={[datasetId, lastUpdatedOn]}
                renderData={(dataset) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>Dataset: {dataset['display_name']}</h4>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${datasetId}/versions`)}
                                refetchOnChanged={[datasetId, lastUpdatedOn]}
                                renderData={(versions) => {
                                    const uncommittedVersion = versions.find((v) => v['committed'] === false);
                                    const dirty = uncommittedVersion['dirty'];

                                    return (
                                        <LoadingForm className='my-2 d-flex' style={{width: 'fit-content'}} onSubmit={async (e) => {
                                            const versionId = e.target.versionId.value;

                                            e.preventDefault();

                                            if (uncommittedVersion['uuid'] === versionId) {
                                                alert('The uncommitted version cannot be checked out.\nTo rollback, select the version you want to rollback to.');

                                                return;
                                            }

                                            if (dirty && !confirm('You have uncommitted changes in your dataset. Checking out will discard these changes.\nDo you really want to continue?')) {
                                                return;
                                            }

                                            try {
                                                await baseJSONClient(`/api/dataset/${datasetId}/checkout/${versionId}`, {
                                                    method: 'POST'
                                                });
                                            } catch (error) {
                                                alert(error.message);
                                            }

                                            setLastUpdatedOn(new Date());
                                        }}>
                                            <Form.Label column className='mb-0 text-nowrap'>Versions:</Form.Label>
                                            <Select required key={versions[0]?.['uuid']} name='versionId' className='ms-1 me-2'>
                                                {
                                                    versions.map((version) => (
                                                        <option key={version['uuid']} value={version['uuid']}>
                                                            {
                                                                version['committed'] ? `"${version['message']}" (${new Date(version['created_at']).toLocaleString()})'` : `<Uncomitted${dirty ? ' (dirty)' : ''}>`
                                                            }
                                                        </option>
                                                    ))
                                                }
                                            </Select>
                                            <Button variant='secondary' size='s' className='text-nowrap me-2' onClick={(e) => {
                                                const versionId = e.target.closest('form').versionId.value;

                                                history.push(`/dataset/version/${versionId}`);
                                            }}>
                                                View/Download Version
                                            </Button>
                                            <LoadingForm.Button type='submit' variant='secondary' size='s' className='text-nowrap' name='action' value='checkout'>
                                                Checkout
                                            </LoadingForm.Button>
                                        </LoadingForm>
                                    );
                                }}
                            />
                            <Link to={`/data-lake?datasetId=${datasetId}`} >See Metrics</Link>
                                &nbsp;|&nbsp;
                            <a href='#' onClick={() => setIsDatasetEditOpen(true)}>Edit Name</a>
                                &nbsp;|&nbsp;
                            <a href='#' onClick={() => setIsDatasetCommitVersionOpen(true)}>Commit</a>
                                &nbsp;|&nbsp;
                            <a href='#' style={{color: 'red'}} onClick={async () => {
                                if (window.confirm('Do you really want to delete this dataset?\nThis action cannot be undone.')) {
                                    await baseJSONClient(`/api/dataset/${datasetId}`, {
                                        method: 'DELETE'
                                    });

                                    history.push('/dataset');
                                }
                            }}>Delete</a>
                            {(isDatasetEditOpen) ? (
                                <DatasetEditModal isOpen dataset={dataset}
                                    onClose={() => {
                                        setIsDatasetEditOpen(false);
                                    }}
                                    onDatasetSaved={({uuid}) => {
                                        setIsDatasetEditOpen(false);
                                        setLastUpdatedOn(new Date());
                                        history.push(`/dataset/${uuid}`);
                                    }}
                                />
                            ) : null}
                            {(isDatasetCommitOpen) ? (
                                <DatasetCommitModal isOpen datasetId={datasetId}
                                    onClose={() => {
                                        setIsDatasetCommitVersionOpen(false);
                                    }}
                                    onCommit={() => {
                                        setIsDatasetCommitVersionOpen(false);
                                        setLastUpdatedOn(new Date());
                                    }}
                                />
                            ) : null}
                        </div>
                    </>
                )}
            />
            <Container fluid>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/${datasetId}/uncommitted-version`)}
                    refetchOnChanged={[datasetId, lastUpdatedOn]}
                    renderData={(uncommittedVersion) => {

                        return (
                            <DatasetVersionViewer versionId={uncommittedVersion['uuid']} showDatapointActions showGroundtruthsInModal />
                        );
                    }}
                />
            </Container>
        </Menu>
    );
};

export default Dataset;
