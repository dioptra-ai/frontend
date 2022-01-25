import PropTypes from 'prop-types';
import BtnIcon from './btn-icon';
import {IconNames} from '../constants';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ButtonGroup = ({next, previous, ...rest}) => {
    const {carouselState: {currentSlide}} = rest;

    return (
        <div className='carousel-button-group'>
            <BtnIcon
                className='text-dark left-arrow'
                disabled={currentSlide === 0 }
                icon={IconNames.ARROW_DOWN}
                onClick={() => previous()}
                size={8}
            />
            <BtnIcon
                className='text-dark right-arrow'
                icon={IconNames.ARROW_DOWN}
                onClick={() => next()}
                size={8}
            />
        </div>
    );
};

ButtonGroup.propTypes = {
    next: PropTypes.func,
    previous: PropTypes.func
};

const CustomCarousel = ({items, onItemClick}) => {

    return (
        <Container>
            <Row>
                {items.map((item, i) => (
                    <Col
                        className='mt-2 rounded cursor-pointer'
                        key={i}
                        onClick={() => onItemClick(item)}
                        xs={4} md={2}
                    >
                        <img alt='Example' src={item} width='100%'/>
                    </Col>

                ))}
            </Row>
        </Container>
    );
};

CustomCarousel.propTypes = {
    items: PropTypes.array,
    onItemClick: PropTypes.func
};

export default CustomCarousel;
