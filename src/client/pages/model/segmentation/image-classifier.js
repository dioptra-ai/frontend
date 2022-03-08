import Segmentation from 'pages/common/segmentation';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';

const TextClassifier = () => {

    return (
        <div className='pb-5'>
            <PerformanceClustersAnalysis/>
            <Segmentation />
        </div>
    );
};

export default TextClassifier;
