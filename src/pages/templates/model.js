import PredictionAnalysis from '../../components/prediction-analysis';
import FilterInput from '../../components/filter-input';
import Tabs from '../../components/tabs';

const Model = () => {
    return (
        <>
            <Tabs tabs={['Performance Overview', 'Performance Details', 'Feature Integrity', 'Incidents & Alerts']}/>
            <FilterInput/>
            <PredictionAnalysis />
        </>
    );
};

export default Model;
