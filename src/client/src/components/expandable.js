import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import {IconNames} from '../constants';

const Expandable = ({content, expandedContent}) => {
    const [expand, setExpand] = useState(false);

    return (
        <>
            <Container>
                <Row className='align-items-center'>
                    <Col lg={11}>{content}</Col>
                    <Col className='text-center small' lg={1}>
                        <span onClick={() => setExpand(!expand)}>
                            <FontIcon icon={expand ? IconNames.ARROW_UP : IconNames.ARROW_DOWN }/>
                        </span>
                    </Col>
                </Row>
            </Container>
            <Container className='border-bottom bg-light'>
                {expand && expandedContent}
            </Container>
        </>
    );
};

Expandable.propTypes = {
    content: PropTypes.element,
    expandedContent: PropTypes.element
};

export default Expandable;
