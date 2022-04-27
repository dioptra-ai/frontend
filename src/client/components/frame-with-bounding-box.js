import PropTypes from 'prop-types';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';

const FrameWithBoundingBox = ({videoUrl, imageUrl, frameH, boxW, boxH, boxT, boxL, videoSeekToSec, videoControls, height, onClick}) => (
    <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''} style={{position: 'relative'}}>
        {videoUrl ? (
            <SeekableVideo
                url={videoUrl}
                seekToSecs={videoSeekToSec}
                height={height}
                width='auto'
                controls={videoControls}
            />
        ) : (
            <SignedImage
                rawUrl={imageUrl}
                height={height}
            />
        )}
        <div
            className='heat-map-box'
            style={{
                position: 'absolute',
                height: boxH * (height / frameH),
                width: boxW * (height / frameH),
                top: boxT * (height / frameH),
                left: boxL * (height / frameH)
            }}
        />
    </div>
);

FrameWithBoundingBox.propTypes = {
    videoUrl: PropTypes.string,
    videoSeekToSec: PropTypes.number,
    imageUrl: PropTypes.string,
    frameH: PropTypes.number.isRequired,
    boxW: PropTypes.number.isRequired,
    boxH: PropTypes.number.isRequired,
    boxT: PropTypes.number.isRequired,
    boxL: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    videoControls: PropTypes.bool,
    onClick: PropTypes.func
};

export default FrameWithBoundingBox;
