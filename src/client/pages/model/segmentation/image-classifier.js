import Segmentation from 'pages/common/segmentation';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';

const TextClassifier = () => {

    return (
        <div className='pb-5'>
            <Segmentation />
            <PerformanceClustersAnalysis/>
        </div>
    );
};

export default TextClassifier;
