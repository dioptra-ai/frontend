import PropTypes from 'prop-types';
import {useState} from 'react';
import {BsMinecartLoaded} from 'react-icons/bs';
import {AiOutlineDatabase} from 'react-icons/ai';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import {useHistory} from 'react-router-dom';

import {IconNames} from 'constants';
import BtnIcon from 'components/btn-icon';
import MinerModal from 'components/miner-modal';
import {setupComponent} from 'helpers/component-helper';
import Menu from 'components/menu';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import DatapointsViewer from 'components/datapoints-viewer';
import useModal from 'hooks/useModal';
import ButtonDownloadCSV from 'components/button-download-csv';
import baseJSONClient from 'clients/base-json-client';

const Cart = ({userStore}) => {
    const history = useHistory();
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const removeDatapointsFromCart = async (uuids) => {
        if (uuids) {
            await userStore.tryUpdate({
                cart: userStore.userData.cart.filter((uuid) => !uuids.has(uuid))
            });
        } else {
            await userStore.tryUpdate({
                cart: []
            });
        }

        setSelectedDatapoints(new Set());
    };

    return (
        <Menu>
            <div className='text-dark px-3'>
                <div className='my-3 d-flex justify-content-between'>
                    <h3>Data Cart</h3>
                    <BtnIcon
                        className='text-dark border-0'
                        icon={IconNames.CLOSE}
                        onClick={() => history.goBack()}
                        size={20}
                    />
                </div>
                <Async
                    fetchData={() => metricsClient('datapoints', {
                        uuids: userStore.userData.cart
                    })}
                    refetchOnChanged={[userStore.userData.cart]}
                    renderData={(datapoints) => (
                        <Row>
                            <Col>
                                <Container fluid>
                                    <Row>
                                        <Col className='ps-3'>
                                                Selected: {selectedDatapoints.size}&nbsp;
                                            {
                                                selectedDatapoints.size ? (
                                                    <a className='text-dark border-0 bg-transparent'
                                                        onClick={() => removeDatapointsFromCart(selectedDatapoints)}
                                                    >
                                                        (remove from cart)
                                                    </a>
                                                ) : null
                                            }
                                        </Col>
                                    </Row>
                                </Container>
                                <DatapointsViewer
                                    datapoints={datapoints}
                                    onSelectedUUIDsChange={setSelectedDatapoints}
                                />
                            </Col>
                            <Col xs={2}>
                                <h5>With {userStore.userData.cart.length} datapoints :</h5>
                                <div className='text-center'>
                                    <Button
                                        className='w-100 text-white btn-submit mb-3'
                                        variant='secondary'
                                        onClick={() => {
                                            setMinerModalOpen(true);
                                        }}>
                                        <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/> Create Miner
                                    </Button>
                                    <Async
                                        fetchData={() => baseJSONClient('/api/datasets')}
                                        renderData={(datasets) => (
                                            <DropdownButton
                                                className='w-100 text-white btn-submit mb-3 d-flex flex-column'
                                                variant='secondary'
                                                menuAlign='right'
                                                title={<><AiOutlineDatabase className='fs-2 ps-2 cursor-pointer' /> Add to Dataset</>}
                                            >
                                                {datasets.map((dataset) => (
                                                    <Dropdown.Item as='button' key={dataset.uuid} onClick={async () => {
                                                        const datapoints = await baseJSONClient('/api/datapoints/from-event-uuids', {
                                                            method: 'POST',
                                                            body: {
                                                                eventUuids: userStore.userData.cart
                                                            }
                                                        });

                                                        await baseJSONClient(`/api/datasets/${dataset.uuid}/datapoints`, {
                                                            method: 'POST',
                                                            body: {
                                                                datapointIds: datapoints.map((datapoint) => datapoint['uuid'])
                                                            }
                                                        });

                                                        history.push(`/datasets/${dataset.uuid}`);
                                                    }}>
                                                        {dataset['display_name']}
                                                    </Dropdown.Item>
                                                ))}
                                            </DropdownButton>
                                        )}
                                    />
                                    <ButtonDownloadCSV uuids={userStore.userData.cart} filename='data-cart.csv'/>
                                    <MinerModal
                                        isOpen={minerModalOpen}
                                        onMinerSaved={(minerId) => {
                                            baseJSONClient('/api/tasks/miners');
                                            setMinerModalOpen(false);
                                            history.push(`/miners/${minerId}`);
                                        }}
                                        onClose={() => setMinerModalOpen(false)}
                                        defaultMiner={{
                                            select_reference: {
                                                filters: [{
                                                    left: 'uuid',
                                                    op: 'in',
                                                    right: userStore.userData.cart
                                                }]
                                            },
                                            strategy: 'NEAREST_NEIGHBORS'
                                        }}
                                    />
                                    <hr/>
                                    <Button
                                        className='w-100 my-3' variant='secondary'
                                        onClick={() => {
                                            if (confirm('Are you sure you want to empty your data cart?')) {
                                                removeDatapointsFromCart();
                                            }
                                        }}
                                    >
                                        Empty Data Cart
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    )}
                />
            </div>
        </Menu>
    );
};

Cart.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Cart);
