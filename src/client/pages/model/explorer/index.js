import PropTypes from 'prop-types';
import {useState} from 'react';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import SamplesPreview from 'components/samples-preview';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';

const ANALYSES = {
    DATA_VIEWER: 'Data Viewer',
    CLUSTERING: 'Clustering',
    OUTLIER: 'Outlier Detection',
    DRIFT: 'Drift Detection'
};

const Explorer = () => {
    const allFilters = useAllFilters();
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
                        selectedAnalysis === 'CLUSTERING' ? <ClustersAnalysis /> : (
                            <div className='my-3'>
                                <Async
                                    fetchData={() => metricsClient('select', {
                                        select: `"uuid", 
                                            "groundtruth",
                                            "prediction",
                                            "image_metadata.uri",
                                            "image_metadata.width",
                                            "image_metadata.height",
                                            "image_metadata.object.width",
                                            "image_metadata.object.height",
                                            "image_metadata.object.left",
                                            "image_metadata.object.top",
                                            "prediction.width",
                                            "prediction.height",
                                            "prediction.left",
                                            "prediction.top",
                                            "prediction.class_name",
                                            "groundtruth.width",
                                            "groundtruth.height",
                                            "groundtruth.left",
                                            "groundtruth.top",
                                            "groundtruth.class_name",
                                            "text"`,
                                        filters: allFilters,
                                        limit: 1000
                                    })}
                                    renderData={(datapoints) => <SamplesPreview samples={datapoints} limit={1000}/>}
                                    refetchOnChanged={[JSON.stringify(allFilters)]}
                                />
                            </div>
                        )
            }
        </>
    );
};

Explorer.propTypes = {
    filtersStore: PropTypes.shape({
        filters: PropTypes.any
    })
};

export default Explorer;
