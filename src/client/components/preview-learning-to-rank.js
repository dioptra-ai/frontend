import PropTypes from 'prop-types';
import {default as truncate} from 'truncate';

import Table from './table';

const PreviewLearningToRank = ({datapoint, labels, displayDetails, onClick}) => { // eslint-disable-line no-unused-vars
    const sortedByGroundtruth = labels?.sort((a, b) => (a['groundtruth']?.['relevance'] || 0) - (b['groundtruth']?.['relevance'] || 0));
    const sortedByPrediction = labels?.sort((a, b) => (a['prediction']?.['score'] || 0) - (b['prediction']?.['score'] || 0));

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <div className='my-2'>
                <i>{datapoint['text']}</i>
            </div>
            {
                displayDetails ?
                    labels ? (
                        <Table
                            columns={[{
                                Header: 'Rank',
                                accessor: 'rank'
                            }, {
                                Header: 'Ground Truth',
                                accessor: 'groundtruth',
                                disableSortBy: true
                            }, {
                                Header: 'Prediction',
                                accessor: 'prediction',
                                disableSortBy: true
                            }]}
                            data={sortedByGroundtruth.map((l, i) => ({
                                groundtruth: (
                                    <div style={{minWidth: 200}} title={l['text']}>{truncate(l['text'], 100)}</div>
                                ),
                                prediction: (
                                    <div style={{minWidth: 200}} title={sortedByPrediction[i]['text']}>{truncate(sortedByPrediction[i]['text'], 100)}</div>
                                ),
                                rank: i + 1
                            }))}
                        />
                    ) : <div>Loading annotations...</div> :
                    null
            }
        </div>
    );
};

PreviewLearningToRank.propTypes = {
    datapoint: PropTypes.object,
    labels: PropTypes.array,
    displayDetails: PropTypes.bool,
    onClick: PropTypes.func
};

export default PreviewLearningToRank;
