import PropTypes from 'prop-types';

import Polyline from './polyline';

const Lane = ({lane, imageHeight, imageWidth, color}) => (
    <div className='position-absolute h-100 w-100'>
        <Polyline
            cocoCoordinates={lane['coco_polyline']}
            lineWidth={8}
            color={color}
            width={imageWidth} height={imageHeight}
        />
    </div>
);

Lane.propTypes = {
    lane: PropTypes.object.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
};

export default Lane;
