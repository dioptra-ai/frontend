import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const PreviewTextClassification = ({datapoint, labels, onClick, ...rest}) => { // eslint-disable-line no-unused-vars
    const groundtruths = labels?.map((l) => l['groundtruth']);
    const predictions = labels?.map((l) => l['prediction']);
    const groundtruth = groundtruths?.length ? groundtruths[0] : null;
    const prediction = predictions?.length ? predictions[0] : null;

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <div className='my-2'>
                <span className='text-muted'>Query: </span><i>{datapoint['text']}</i>
            </div>
            <Row>
                {groundtruth ? <Col xl={6}><span className='text-nowrap'>Ground Truth: </span><i>{groundtruth['class_name']}</i></Col> : null}
                {prediction ? <Col xl={6}><span className='text-nowrap'>Prediction: </span><i>{prediction['class_name']}</i></Col> : null}
            </Row>
        </div>
    );
};

PreviewTextClassification.propTypes = {
    datapoint: PropTypes.object,
    labels: PropTypes.array,
    onClick: PropTypes.func
};

export default PreviewTextClassification;
