import PropTypes from 'prop-types';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import Mislabeling from 'pages/common/mislabeling';
import useAllFilters from 'hooks/use-all-filters';
import DatapointsViewerWithButtons from 'components/datapoints-viewer-with-buttons';

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
                        <DatapointsViewerWithButtons filters={allFilters} />
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
