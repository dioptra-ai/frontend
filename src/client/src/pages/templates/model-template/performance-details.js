import FilterInput from '../../../components/filter-input';
import PredictionAnalysis from '../../../components/prediction-analysis';
import OutlierDetection from '../../../components/outlier-detection';
import {setupComponent} from '../../../helpers/component-helper';


const PerformanceDetails = () => {
    return (
        <>
            <FilterInput/>
            <PredictionAnalysis />
            <OutlierDetection />
        </>
    );
};

export default setupComponent(PerformanceDetails);
