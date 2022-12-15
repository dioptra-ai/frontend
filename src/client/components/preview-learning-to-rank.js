import PropTypes from 'prop-types';
import {default as truncate} from 'truncate';
import PreviewDetails from './preview-details';

import Table from './table';

const PreviewLearningToRank = ({datapoint, labels, displayDetails, onClick}) => { // eslint-disable-line no-unused-vars
    const sortedByScore = labels?.sort((a, b) => (b['prediction']?.['score'] || 0) - (a['prediction']?.['score'] || 0));

    return (
        <div className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
            <div className='my-2'>
                <span className='text-muted'>Query: </span><i>{datapoint['text']}</i>
            </div>
            {
                displayDetails ? (
                    <>
                        {

                            labels ? (
                                <Table
                                    columns={[{
                                        Header: 'Rank',
                                        accessor: 'rank'
                                    }, {
                                        Header: 'Score',
                                        accessor: 'score',
                                        disableSortBy: true
                                    }, {
                                        Header: 'Prediction',
                                        accessor: 'prediction',
                                        disableSortBy: true
                                    }, {
                                        Header: 'Relevance',
                                        accessor: 'relevance'
                                    }]}
                                    data={sortedByScore.map((l, i) => ({
                                        rank: i + 1,
                                        score: Number(l['prediction']?.['score']),
                                        relevance: Number(l['groundtruth']?.['relevance']),
                                        prediction: (
                                            <div style={{minWidth: 200}} title={sortedByScore[i]['text']}>{truncate(sortedByScore[i]['text'], 100)}</div>
                                        )
                                    }))}
                                />
                            ) : <div>Loading annotations...</div>
                        }
                        <hr />
                        <PreviewDetails datapoint={datapoint} labels={labels} />
                    </>
                ) : null
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
