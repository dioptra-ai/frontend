import PropTypes from 'prop-types';
import {useState} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsMinecartLoaded} from 'react-icons/bs';
import {AiOutlineDatabase, AiOutlineDelete} from 'react-icons/ai';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
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
                                <DatapointsViewer
                                    datapoints={datapoints}
                                    onSelectedUUIDsChange={setSelectedDatapoints}
                                    renderButtons={() => selectedDatapoints.size ? (
                                        <OverlayTrigger overlay={<Tooltip>Remove {selectedDatapoints.size} items from cart</Tooltip>}>
                                            <button className='d-flex text-dark border-0 bg-transparent click-down'
                                                onClick={() => removeDatapointsFromCart(selectedDatapoints)}
                                            >
                                                <AiOutlineDelete className='fs-4' />
                                            </button>
                                        </OverlayTrigger>
                                    ) : null}
                                />
                            </Col>
                            <Col xs={2}>
                                <h5 className='text-center'>Total: {userStore.userData.cart.length} items</h5>
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
                                        fetchData={() => baseJSONClient('/api/dataset')}
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

                                                        await baseJSONClient(`/api/dataset/${dataset.uuid}/add`, {
                                                            method: 'POST',
                                                            body: {
                                                                datapointIds: datapoints.map((datapoint) => datapoint['uuid'])
                                                            }
                                                        });

                                                        history.push(`/dataset/${dataset.uuid}`);
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
