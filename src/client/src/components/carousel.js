import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import PropTypes from 'prop-types';
import BtnIcon from './btn-icon';
import {IconNames} from '../constants';

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
    const responsive = {
        desktop: {
            breakpoint: {max: 3000, min: 1024},
            items: 8
        },
        tablet: {
            breakpoint: {max: 1024, min: 464},
            items: 4
        },
        mobile: {
            breakpoint: {max: 464, min: 0},
            items: 2
        }
    };

    return (
        <div className='carousel-wrapper'>
            <Carousel
                arrows={false}
                className='my-3'
                containerClass='carousel-container'
                customButtonGroup={<ButtonGroup/>}
                renderButtonGroupOutside={true}
                responsive={responsive}
                transitionDuration={500}
            >
                {items.map((item, i) => (
                    <div
                        className='mx-2 rounded cursor-pointer'
                        key={i}
                        onClick={() => onItemClick(item)}
                    >
                        <img alt='Example' src={item} width='100%'/>
                    </div>

                ))}
            </Carousel>
        </div>
    );
};

CustomCarousel.propTypes = {
    items: PropTypes.array,
    onItemClick: PropTypes.func
};

export default CustomCarousel;
