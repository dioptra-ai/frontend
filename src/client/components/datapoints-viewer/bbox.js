import PropTypes from 'prop-types';
import {MdOutlineVerifiedUser} from 'react-icons/md';

import Canvas from 'components/canvas';
import {getHexColor} from 'helpers/color-helper';
import SegmentationMask from './segmentation-mask';
import Polyline from './polyline';

const BBox = ({bbox, imageHeight, imageWidth, showHeatMap}) => {
    const heatmap = bbox['feature_heatmap'];
    const heatMapMax = heatmap && Math.max(...heatmap.flat());
    const normalizedTop = bbox['top'] / imageHeight;
    const normalizedLeft = bbox['left'] / imageWidth;
    const normalizedHeight = bbox['height'] / imageHeight;
    const normalizedWidth = bbox['width'] / imageWidth;

    return (
        <>
            {
                bbox['encoded_resized_segmentation_mask'] ? (
                    <div className='position-absolute h-100 w-100'>
                        <SegmentationMask
                            encodedMask={bbox['encoded_resized_segmentation_mask']}
                            classNames={[null, bbox['class_name']]}
                        />
                    </div>
                ) : null
            }
            {
                bbox['coco_polygon'] ? (
                    <div className='position-absolute h-100 w-100'>
                        <Polyline closed width={imageWidth} height={imageHeight} cocoCoordinates={bbox['coco_polygon']} className={bbox['class_name']} />
                    </div>
                ) : null
            }
            <div className='position-absolute'
                style={{
                    height: `${normalizedHeight * 100}%`,
                    width: `${normalizedWidth * 100}%`,
                    top: `${normalizedTop * 100}%`,
                    left: `${normalizedLeft * 100}%`,
                    border: '1px dashed',
                    borderColor: getHexColor(bbox['class_name']),
                    boxSizing: 'content-box'
                }}
            >
                <span className='fs-7 position-absolute px-1 text-nowrap' style={{
                    backgroundColor: getHexColor(bbox['class_name']),
                    bottom: bbox['top'] > imageHeight - bbox['top'] - bbox['height'] ? '100%' : 'unset',
                    top: bbox['top'] > imageHeight - bbox['top'] - bbox['height'] ? 'unset' : '100%',
                    left: bbox['left'] < imageWidth - bbox['left'] - bbox['width'] ? '100%' : 'unset',
                    right: bbox['left'] < imageWidth - bbox['left'] - bbox['width'] ? 'unset' : '100%'
                }}
                ><MdOutlineVerifiedUser />{bbox['class_name']}</span>
            </div>
            {
                heatmap && showHeatMap ? (

                    <Canvas draw={(ctx) => {
                        const numRows = heatmap.length;
                        const numCols = heatmap[0].length;

                        ctx.canvas.width = numCols;
                        ctx.canvas.height = numRows;

                        heatmap.forEach((row, i) => {
                            row.forEach((col, j) => {
                                ctx.fillStyle = `hsla(${(1 - col / heatMapMax) * 240}, 100%, 50%, 0.3)`;
                                ctx.fillRect(j, i, 1, 1);
                            });
                        });
                    }} />
                ) : null
            }
        </>
    );
};

BBox.propTypes = {
    bbox: PropTypes.object.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number.isRequired,
    showHeatMap: PropTypes.bool
};

export default BBox;
