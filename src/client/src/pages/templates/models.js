import {Link} from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import {Col, Container, Row} from 'react-bootstrap';

import GeneralSearchBar from './general-search-bar';
import {setupComponent} from '../../helpers/component-helper';

const Models = ({modelStore}) => {
    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput={true} />
            <Container>
                <Row>
                    <Col>
                        Model Name
                    </Col>
                    <Col xs={2}>Owner</Col>
                    <Col xs={2}>Tier</Col>
                    <Col xs={2}>Last Deployed</Col>
                </Row>
                {modelStore.models.map((model) => (
                    <Row key={model.mlModelId}>
                        <Col>
                            <Link to={`/models/${model.mlModelId}/performance-overview`}><b>{model.name}</b></Link>
                        </Col>
                        <Col xs={2}>
                            {model.team?.name}
                        </Col>
                        <Col xs={2}>
                            {model.tier}
                        </Col>
                        <Col xs={2}>
                            {model.lastDeployed}
                        </Col>
                    </Row>
                ))}
            </Container>
        </>
    );
};

Models.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Models);
