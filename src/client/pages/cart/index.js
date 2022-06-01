import oHash from 'object-hash';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {BsMinecartLoaded} from 'react-icons/bs';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import MinerModal from 'components/miner-modal';
import {setupComponent} from 'helpers/component-helper';
import Menu from 'components/menu';
import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import metricsClient from 'clients/metrics';
import DatapointsViewer from 'components/datapoints-viewer';
import useModal from 'hooks/useModal';
import ButtonDownloadCSV from 'components/button-download-csv';

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
                <Async
                    fetchData={() => metricsClient('datapoints', {
                        request_ids: userStore.userData.cart
                    })}
                    refetchOnChanged={[userStore.userData.cart]}
                    renderData={(datapoints) => (
                        <Row>
                            <Col>
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
                                    <ButtonDownloadCSV requestIds={userStore.userData.cart} filename='data-cart.csv'/>
                                    <MinerModal isOpen={minerModalOpen} onClose={() => setMinerModalOpen(false)} requestIds={selectedRequestIds}/>
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
