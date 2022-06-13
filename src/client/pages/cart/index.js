import oHash from 'object-hash';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {BsMinecartLoaded} from 'react-icons/bs';
import Button from 'react-bootstrap/Button';
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

const Cart = ({userStore}) => {
    const history = useHistory();
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const removeDatapointsFromCart = async (uuids) => {
        if (uuids) {
            await userStore.tryUpdate({
                cart: userStore.userData.cart.filter((_, i) => !uuids.has(i))
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
                                                Selected Datapoints: {selectedDatapoints.size}&nbsp;
                                            {
                                                selectedDatapoints.size ? (
                                                    <a className='text-dark border-0 bg-transparent click-down'
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
                                    onSelectedChange={setSelectedDatapoints}
                                    key={oHash(datapoints)} // Resets selected state when datapoints change.
                                />
                            </Col>
                            <Col xs={2}>
                                <h5>With {userStore.userData.cart.length} datapoints :</h5>
                                <div className='text-center'>
                                    <Button
                                        className='w-100 text-white btn-submit click-down mb-3'
                                        variant='secondary'
                                        onClick={() => {
                                            setMinerModalOpen(true);
                                        }}>
                                        <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/> Create Miner
                                    </Button>
                                    <ButtonDownloadCSV uuids={userStore.userData.cart} filename='data-cart.csv'/>
                                    <MinerModal isOpen={minerModalOpen} onClose={() => setMinerModalOpen(false)} uuids={userStore.userData.cart}/>
                                    <hr/>
                                    <Button
                                        className='w-100 click-down my-3' variant='secondary'
                                        onClick={() => removeDatapointsFromCart()}
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
