import PredictionAnalysis from '../../components/prediction-analysis';
import FilterInput from '../../components/filter-input';
import Tabs from '../../components/tabs';
import ModelDescription from '../../components/model-description';

const Model = () => {
    return (
        <>
          <ModelDescription
                deployed='May 5th, 2021 at 18:30'
                description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.'
                incidents={4}
                owner='GG Team'
                tier={5}
                title='Credit Card Transaction Fraud Detection'
                version='V 1.01'
            />
            <Tabs tabs={['Performance Overview', 'Performance Details', 'Feature Integrity', 'Incidents & Alerts']}/>
            <FilterInput/>
            <PredictionAnalysis />
        </>
    );
};

export default Model;
