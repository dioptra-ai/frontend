import {useContext} from 'react';
import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';
import useModel from 'hooks/use-model';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';
import appContext from 'context/app-context';

const AsyncSegmentationFields = ({timeStore, ...props}) => {
    const model = useModel();
    const allSqlFilters = useAllSqlFilters();
    const {isModelView} = useContext(appContext);

    return (
        <Async
            fetchData={async () => {
                let columns = null;

                switch (model?.mlModelType) {
                case 'TABULAR_CLASSIFIER':

                    columns = await metricsClient('queries/columns-names-for-features');
                    break;
                case 'SPEECH_TO_TEXT':

                    columns = await metricsClient('queries/columns-names-for-audio');
                    break;
                case 'TEXT_CLASSIFIER':
                case 'UNSUPERVISED_TEXT_CLASSIFIER':

                    columns = await metricsClient('queries/columns-names-for-text');
                    break;
                case 'IMAGE_CLASSIFIER':
                case 'UNSUPERVISED_IMAGE_CLASSIFIER':
                case 'UNSUPERVISED_OBJECT_DETECTION':

                    columns = await metricsClient('queries/columns-names-for-image');
                    break;
                default:

                    columns = await metricsClient('queries/columns-names-for-tags');
                    break;
                }

                return metricsClient('queries/fairness-bias-columns-counts', {
                    fields: columns.map((c) => c.column),
                    sql_filters: isModelView ? timeStore.sqlTimeFilter : allSqlFilters,
                    ml_model_id: model?.mlModelId
                });
            }}
            {...props}
        />
    );
};

AsyncSegmentationFields.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(AsyncSegmentationFields);
