import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const PreviewTextClassification = ({sample, onClick, ...rest}) => { // eslint-disable-line no-unused-vars

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <i>{sample['text']}</i>
            <Row className='mt-2'>
                {sample['groundtruth'] ? <Col xl={6}><span className='text-nowrap'>Ground Truth: </span><i>{sample['groundtruth']['class_name']}</i></Col> : null}
                <Col xl={6}><span className='text-nowrap'>Prediction: </span><i>{sample['prediction']['class_name']}</i></Col>
            </Row>
        </div>
    );
};

PreviewTextClassification.propTypes = {
    sample: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default PreviewTextClassification;
