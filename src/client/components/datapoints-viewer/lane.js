import PropTypes from 'prop-types';

import Polyline from './polyline';

const Lane = ({lane, imageHeight, imageWidth}) => (
    <div className='position-absolute h-100 w-100'>
        <Polyline
            cocoCoordinates={lane['coco_polyline']}
            lineWidth={4}
            className={lane['class_name']}
            width={imageWidth} height={imageHeight}
        />
    </div>
);

Lane.propTypes = {
    lane: PropTypes.object.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number.isRequired
};

export default Lane;
