/* eslint-disable complexity */
import {useContext} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import useModel from 'hooks/use-model';
import comparisonContext from 'context/comparison-context';
import MetricChart from 'pages/common/metric-chart';
import PerformancePerGroup from 'pages/common/performance-per-class';
import ConfusionMatrix from 'components/confusion-matrix';
import ClassDistribution from 'pages/common/class-distribution';
import Segmentation from 'pages/common/segmentation';

const Performance = () => {
    const model = useModel();
    const {total: comparisonTotal} = useContext(comparisonContext);
    const metricBoxBreakpoints = [{}, {
        xs: 3
    }, {
        xs: 3
    }, {
        xs: 3,
        md: 2
    }, {
        s: 3,
        md: 2
    }][comparisonTotal];
    const metrics = ['THROUGHPUT'];

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'TABULAR_CLASSIFIER':
    case 'TEXT_CLASSIFIER':
    case 'NER':

        metrics.push(
            'ACCURACY',
            'F1_SCORE',
            'PRECISION',
            'RECALL'
        );
        break;
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
    case 'UNSUPERVISED_OBJECT_DETECTION':

        metrics.push(
            'CONFIDENCE',
            'ENTROPY'
        );
        break;
    case 'DOCUMENT_PROCESSING':
        metrics.push(
            'MAP',
            'MAR',
            'EXACT_MATCH',
            'F1_SCORE'
        );
        break;
    case 'Q_N_A':
        metrics.push(
            'EXACT_MATCH',
            'F1_SCORE',
            'SEMANTIC_SIMILARITY'
        );
        break;
    case 'AUTO_COMPLETION':
        metrics.push(
            'EXACT_MATCH',
            'F1_SCORE'
        );
        break;
    case 'SEMANTIC_SIMILARITY':
        metrics.push(
            'COSINE_PEARSON_CORRELATION',
            'COSINE_SPEARMAN_CORRELATION'
        );
        break;
    case 'SPEECH_TO_TEXT':
        metrics.push(
            'EXACT_MATCH',
            'WORD_ERROR_RATE'
        );
        break;
    case 'MULTIPLE_OBJECT_TRACKING':
        break;
    case 'LEARNING_TO_RANK':
        metrics.push(
            'MRR',
            'MEAN_NDCG'
        );
        break;
    default:
        break;
    }


    // EMBEDDING_DRIFT not yet implemented when not over time, so we add it only for the chart.
    const timeMetrics = [...metrics, 'EMBEDDING_DRIFT'];
    const widgets = [];

    switch (model.mlModelType) {
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
        widgets.push(<PerformancePerGroup />, <Segmentation />);
        break;
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_OBJECT_DETECTION':
        widgets.push(<ClassDistribution classFieldDisplayName='Prediction' classField="prediction->>'class_name'"/>, <PerformancePerGroup />, <Segmentation />);
        timeMetrics.push('BRIGHTNESS', 'SHARPNESS', 'CONTRAST');
        break;
    case 'LEARNING_TO_RANK':
        widgets.push(<PerformancePerGroup />, <Segmentation />);
        timeMetrics.push('FEATURES_DRIFT');
        break;
    default:
        widgets.push(<ClassDistribution classFieldDisplayName='Ground Truth' classField="groundtruth->>'class_name'"/>, <PerformancePerGroup/>, <ConfusionMatrix />, <Segmentation />);
    }

    return (
        <>
            <Row className='mb-3 g-2'>
                {
                    metrics.map((m) => (
                        <Col key={m} className='d-flex' {...metricBoxBreakpoints[comparisonTotal]}>
                            <MetricChart type='stat' selectedMetric={m}/>
                        </Col>
                    ))
                }
            </Row>
            <div className='my-3'>
                <MetricChart
                    type='timeseries'
                    selectableMetrics={timeMetrics}
                />
            </div>
            {
                widgets.map((w, i) => (
                    <div className='my-3' key={i}>
                        {w}
                    </div>
                ))
            }
        </>
    );
};

export default Performance;
