import Segmentation from 'pages/common/segmentation';
import ClustersAnalysis from 'pages/common/clusters-analysis';

const TextClassifier = () => {

    return (
        <div className='pb-5'>
            <ClustersAnalysis/>
            <Segmentation />
        </div>
    );
};

export default TextClassifier;
