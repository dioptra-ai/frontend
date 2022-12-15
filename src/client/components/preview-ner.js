import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {getHexColor} from 'helpers/color-helper';

const PreviewNER = ({datapoint, labels, onClick}) => { // eslint-disable-line no-unused-vars
    const text = datapoint['text'];

    let groundtruths = labels?.map((l) => l['groundtruth']);

    let predictions = labels?.map((l) => l['prediction']);

    if (!groundtruths?.length) {
        groundtruths = (groundtruths || []).concat().push({
            start: datapoint['groundtruth.start'],
            end: datapoint['groundtruth.end'],
            class_name: datapoint['groundtruth.class_name']
        });
    }

    if (!predictions?.length) {
        predictions = (predictions || []).concat().push({
            start: datapoint['prediction.start'],
            end: datapoint['prediction.end'],
            class_name: datapoint['prediction.class_name'],
            confidence: datapoint['prediction.confidence']
        });
    }

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <Row className='mt-2'>
                {groundtruths.length ? (
                    <Col>
                        <span className='text-nowrap'>Ground Truth: </span>
                        {
                            groundtruths.map((gt, i) => (
                                <span key={i}>
                                    {text.slice(i === 0 ? 0 : groundtruths[i - 1].end, gt.start)}
                                    <div className='d-inline px-1 rounded' style={{
                                        backgroundColor: getHexColor(gt.class_name)
                                    }}>
                                        {text.slice(gt.start, gt.end)}<span className='text-white ps-1 fs-7'>{gt.class_name}</span>
                                    </div>
                                    {text.slice(gt.end, i === groundtruths.length - 1 ? text.length : groundtruths[i + 1].start)}
                                </span>
                            ))
                        }
                    </Col>
                ) : null}
            </Row>            <Row className='mt-2'>
                {predictions.length ? (
                    <Col>
                        <span className='text-nowrap'>Prediction: </span>
                        {
                            predictions.map((pred, i) => (
                                <span key={i}>
                                    {text.slice(i === 0 ? 0 : predictions[i - 1].end, pred.start)}
                                    <div className='d-inline px-1 rounded' style={{
                                        backgroundColor: getHexColor(pred.class_name)
                                    }}>
                                        {text.slice(pred.start, pred.end)}<span className='text-white ps-1 fs-7'>{pred.class_name}</span>
                                    </div>
                                    {text.slice(pred.end, i === predictions.length - 1 ? text.length : predictions[i + 1].start)}
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
    datapoint: PropTypes.object,
    labels: PropTypes.array,
    onClick: PropTypes.func
};

export default PreviewNER;
