import ClassDistribution from 'pages/common/class-distribution';
import BBoxLocationAnalysis from 'pages/common/bbox-location-analysis';

const PredictionAnalysis = () => {

    return (
        <>
            <div className='my-3'>
                <ClassDistribution/>
            </div>
            <div className='my-3'>
                <BBoxLocationAnalysis/>
            </div>

        </>
    );
};

export default PredictionAnalysis;
