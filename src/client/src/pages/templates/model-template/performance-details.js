import FilterInput from '../../../components/filter-input';
import PredictionAnalysis from '../../../components/prediction-analysis';
import OutlierDetection from '../../../components/outlier-detection';


const PerformanceDetails = () => {
    return (
        <>
            <FilterInput/>
            <PredictionAnalysis />
            <OutlierDetection />
        </>
    );
};

export default PerformanceDetails;
