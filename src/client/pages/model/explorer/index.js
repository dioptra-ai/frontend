import PropTypes from 'prop-types';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import Mislabeling from 'pages/common/mislabeling';
import SamplesPreview from 'components/samples-preview';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';

const ANALYSES = {
    VIEWER: 'Data Viewer',
    CLUSTERING: 'Clustering',
    OUTLIER: 'Outlier Detection',
    DRIFT: 'Drift Detection',
    MISLABELING: 'Mislabeling Detection'
};

const Explorer = () => {
    const allFilters = useAllFilters();
    const analysesKeys = Object.keys(ANALYSES);
    const history = useHistory();

    return (
        <>
            <Select required defaultValue={location.pathname.slice(1).toUpperCase()} onChange={(value) => {
                history.push({
                    ...history.location,
                    pathname: `/${value.toLowerCase()}`
                });
            }}>
                {
                    analysesKeys.map((k) => (
                        <option value={k} key={k}>{ANALYSES[k]}</option>
                    ))
                }
            </Select>
            <Switch>
                <Route path='/viewer' render={() => (
                    <div className='my-3'>
                        <Async
                            fetchData={async () => {
                                const requestDatapoints = await metricsClient('select', {
                                    select: '"uuid", "request_id", "image_metadata", "text_metadata", "video_metadata","text", "tags"',
                                    filters: [...allFilters, {
                                        left: 'prediction',
                                        op: 'is null'
                                    }, {
                                        left: 'groundtruth',
                                        op: 'is null'
                                    }],
                                    limit: 1000
                                });

                                if (requestDatapoints.length) {

                                    return requestDatapoints;
                                } else return metricsClient('select', {
                                    select: `
                                            "uuid", "request_id", "image_metadata", "text_metadata", "video_metadata", "text", 
                                            "tags"
                                            `,
                                    filters: allFilters,
                                    limit: 1000,
                                    rm_fields: ['embeddings', 'logits']
                                });
                            }}
                            renderData={(datapoints) => <SamplesPreview samples={datapoints} limit={1000} />}
                            refetchOnChanged={[JSON.stringify(allFilters)]}
                        />
                    </div>
                )}/>
                <Route path='/mislabeling' component={Mislabeling}/>
                <Route path='/clustering' component={ClustersAnalysis}/>
                <Route path='/outlier' component={OutliersOrDrift}/>
                <Route path='/drift' render={() => <OutliersOrDrift isDrift/>}/>
                <Redirect to={{
                    ...history.location,
                    pathname: '/viewer'
                }} />
            </Switch>
        </>
    );
};

Explorer.propTypes = {
    filtersStore: PropTypes.shape({
        filters: PropTypes.any
    })
};

export default Explorer;
