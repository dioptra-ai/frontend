import {useState} from 'react';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';

const ANALYSES = {
    CLUSTERING: 'Clustering',
    OUTLIER: 'Outlier Detection',
    DRIFT: 'Drift Detection'
};

const EmbeddingSpace = () => {
    const analysesKeys = Object.keys(ANALYSES);
    const [selectedAnalysis, setSelectedAnalysis] = useState(analysesKeys[0]);

    return (
        <>
            <Select required defaultValue={selectedAnalysis} onChange={setSelectedAnalysis}>
                {
                    analysesKeys.map((k) => (
                        <option value={k} key={k}>{ANALYSES[k]}</option>
                    ))
                }
            </Select>
            {
                selectedAnalysis === 'DRIFT' ? <OutliersOrDrift isDrift/> :
                    selectedAnalysis === 'OUTLIER' ? <OutliersOrDrift/> :
                        selectedAnalysis === 'CLUSTERING' ? <ClustersAnalysis /> : null
            }
        </>
    );
};

export default EmbeddingSpace;
