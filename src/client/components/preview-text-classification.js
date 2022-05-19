import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const PreviewTextClassification = ({sample, onClick, ...rest}) => { // eslint-disable-line no-unused-vars

    return (
        <div className={onClick ? 'pointer' : ''} onClick={onClick}>
            <div>
                Text: {sample['text']}
            </div>
            <Row className='mt-2'>
                <Col xs={6}><span className='text-nowrap'>Ground Truth: </span>{sample['groundtruth']}</Col>
                <Col xs={6}><span className='text-nowrap'>Prediction: </span>{sample['prediction']}</Col>
            </Row>
        </div>
    );
};

PreviewTextClassification.propTypes = {
    sample: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default PreviewTextClassification;
