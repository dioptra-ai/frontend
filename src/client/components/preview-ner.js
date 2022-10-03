import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {getHexColor} from 'helpers/color-helper';

const PreviewNER = ({sample, onClick}) => { // eslint-disable-line no-unused-vars
    const text = sample['text'];
    const groundtruth = sample['groundtruth'] || [];
    const prediction = sample['prediction'] || [];

    if (groundtruth.length === 0) {
        groundtruth.push({
            start: sample['groundtruth.start'],
            end: sample['groundtruth.end'],
            class_name: sample['groundtruth.class_name']
        });
    }

    if (prediction.length === 0) {
        prediction.push({
            start: sample['prediction.start'],
            end: sample['prediction.end'],
            class_name: sample['prediction.class_name'],
            confidence: sample['prediction.confidence']
        });
    }

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <Row className='mt-2'>
                {groundtruth.length ? (
                    <Col>
                        <span className='text-nowrap'>Ground Truth: </span>
                        {
                            groundtruth.map((gt, i) => (
                                <span key={i}>
                                    {text.slice(i === 0 ? 0 : groundtruth[i - 1].end, gt.start)}
                                    <div className='d-inline px-1 rounded' style={{
                                        backgroundColor: getHexColor(gt.class_name)
                                    }}>
                                        {text.slice(gt.start, gt.end)}<span className='text-white ps-1 fs-7'>{gt.class_name}</span>
                                    </div>
                                    {text.slice(gt.end, i === groundtruth.length - 1 ? text.length : groundtruth[i + 1].start)}
                                </span>
                            ))
                        }
                    </Col>
                ) : null}
            </Row>            <Row className='mt-2'>
                {prediction.length ? (
                    <Col>
                        <span className='text-nowrap'>Prediction: </span>
                        {
                            prediction.map((pred, i) => (
                                <span key={i}>
                                    {text.slice(i === 0 ? 0 : prediction[i - 1].end, pred.start)}
                                    <div className='d-inline px-1 rounded' style={{
                                        backgroundColor: getHexColor(pred.class_name)
                                    }}>
                                        {text.slice(pred.start, pred.end)}<span className='text-white ps-1 fs-7'>{pred.class_name}</span>
                                    </div>
                                    {text.slice(pred.end, i === prediction.length - 1 ? text.length : prediction[i + 1].start)}
                                </span>
                            ))
                        }
                    </Col>
                ) : null}
            </Row>
        </div>
    );
};

PreviewNER.propTypes = {
    sample: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default PreviewNER;
