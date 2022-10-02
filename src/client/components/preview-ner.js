import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const PreviewNER = ({sample, onClick}) => { // eslint-disable-line no-unused-vars
    const text = sample['text'];
    const groundtruth_start = sample['groundtruth.start'];
    const groundtruth_end = sample['groundtruth.end'];
    const groundtruth = sample['groundtruth.class_name'];
    const prediction_start = sample['prediction.start'];
    const prediction_end = sample['prediction.end'];
    const prediction = sample['prediction.class_name'];

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <Row className='mt-2'>
                {groundtruth ? (
                    <Col>
                        <span className='text-nowrap'>Ground Truth: </span>
                        {text.slice(0, groundtruth_start)}[{text.slice(groundtruth_start, groundtruth_end)}<sup>{groundtruth}</sup>]{text.slice(groundtruth_end)}
                    </Col>
                ) : null}
            </Row>
            <Row className='mt-2'>
                {prediction ? (
                    <Col>
                        <span className='text-nowrap'>Prediction: </span>
                        {text.slice(0, prediction_start)}[{text.slice(prediction_start, prediction_end)}<sup>{prediction}</sup>]{text.slice(prediction_end)}
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
