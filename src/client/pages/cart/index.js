import oHash from 'object-hash';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {BsMinecartLoaded} from 'react-icons/bs';
import {IoDownloadOutline} from 'react-icons/io5';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import {saveAs} from 'file-saver';

import MinerModal from 'components/miner-modal';
import {setupComponent} from 'helpers/component-helper';
import Menu from 'components/menu';
import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import metricsClient from 'clients/metrics';
import DatapointsViewer from 'components/datapoints-viewer';
import useModal from 'hooks/useModal';

const Cart = ({userStore}) => {
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const selectedRequestIds = userStore.userData.cart.filter((_, i) => selectedDatapoints.has(i));

    return (
        <Menu>
            <TopBar showTimePicker/>
            <div className='text-dark p-2'>
                <div className='mb-5' style={{fontSize: 24}}>
                    Data Cart
                </div>
                <Row>
                    <Col>
                        <Async
                            fetchData={() => metricsClient('datapoints', {
                                request_ids: userStore.userData.cart
                            })}
                            refetchOnChanged={[userStore.userData.cart]}
                            renderData={(datapoints) => (
                                <>
                                    <Container fluid>
                                        <Row>
                                            <Col className='ps-3'>
                                                Selected Datapoints: {selectedDatapoints.size}&nbsp;
                                                {
                                                    selectedDatapoints.size ? (
                                                        <a
                                                            className='text-dark border-0 bg-transparent click-down'
                                                            onClick={async () => {

                                                                await userStore.tryUpdate({
                                                                    cart: userStore.userData.cart.filter((_, i) => !selectedDatapoints.has(i))
                                                                });
                                                                setSelectedDatapoints(new Set());
                                                            }}
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
                                        onSelectedChange={setSelectedDatapoints}
                                        key={oHash(datapoints)} // Resets selected state when datapoints change.
                                    />
                                </>
                            )}
                        />
                    </Col>
                    <Col xs={2}>
                        <h5>Total Datapoints: {userStore.userData.cart.length}</h5>
                        <div className='text-center'>
                            <Button
                                className='w-100 text-white btn-submit click-down mb-3'
                                variant='secondary'
                                onClick={() => {
                                    setMinerModalOpen(true);
                                }}>
                                <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/> Create Miner
                            </Button>
                            <Button
                                className='w-100 text-white btn-submit click-down mb-3'
                                variant='secondary'
                                onClick={() => {
                                    saveAs(new Blob([userStore.userData.cart], {type: 'text/csv;charset=utf-8'}), 'data-cart.csv');
                                }}>
                                <IoDownloadOutline className='fs-2 cursor-pointer'/> Download as CSV
                            </Button>
                            <MinerModal isOpen={minerModalOpen} onClose={() => setMinerModalOpen(false)} requestIds={selectedRequestIds}/>
                        </div>
                    </Col>
                </Row>
            </div>
        </Menu>
    );
};

Cart.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Cart);
