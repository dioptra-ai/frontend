import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {getName} from 'helpers/name-helper';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import MatrixTable from 'components/matrix-table';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ImageExamples from './image-examples';
import TabularExamples from './tabular-examples';
import useModel from 'customHooks/use-model';

const Table = ({data, onCellClick, groundtruthClasses, predictionClasses}) => {
    const getColumns = (predictionClasses) => {
        const classes = predictionClasses.map((c) => ({
            Header: getName(c),
            accessor: c,
            Cell: ({value}) => !value ? 0 : `${(value * 100).toFixed(2)} %`
        }));

        return ([{
            Header: '',
            accessor: 'groundtruth',
            Cell: ({value}) => getName(value)
        }, ...classes]);
    };

    const getTableRows = (groundtruthClasses, matrixData) => {
        const rows = groundtruthClasses.map((c) => {
            const filtered = matrixData.filter((d) => d.groundtruth === c);
            const cells = {groundtruth: c};

            filtered.forEach((e) => {
                cells[e.prediction] = e.distribution;
            });

            return cells;

        });

        return (rows);
    };

    return (
        <>
            <div className='position-relative' style={{marginLeft: '30px'}}>
                <p className='text-secondary m-0 mb-2 text-center bold-text'>Prediction</p>
                <MatrixTable columns={getColumns(predictionClasses)} data={getTableRows(groundtruthClasses, data)} onCellClick={onCellClick}/>
                <p
                    className='position-absolute text-secondary m-0 text-center bold-text'
                    style={{transform: 'rotate(-90deg)', top: '50%', left: '-70px'}}
                >
                   Ground Truth
                </p>
            </div>
        </>
    );
};

Table.propTypes = {
    data: PropTypes.array,
    groundtruthClasses: PropTypes.array,
    onCellClick: PropTypes.func,
    predictionClasses: PropTypes.array
};

const ConfusionMatrix = () => {
    const [selectedCell, setSelectedCell] = useState(null);
    const model = useModel();
    const allSqlFilters = useAllSqlFilters();

    const getClasses = (data, key) => {
        const classes = [];

        data.forEach((obj) => {
            if (classes.indexOf(obj[key]) === -1 && obj[key]) {
                classes.push(obj[key]);
            }
        });

        return classes;
    };

    return (

        <div className='my-5'>
            <h3 className='text-dark bold-text fs-3 mb-3'>Confusion matrix</h3>
            <div className='border rounded p-3'>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <Table
                            data={data}
                            groundtruthClasses={getClasses(data, 'groundtruth')}
                            onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})}
                            predictionClasses = {getClasses(data, 'prediction')}
                        />
                    )}
                    sql={sql`
                        SELECT
                        predictionTable.groundtruth,
                        predictionTable.prediction,
                        cast(predictionTable.c as FLOAT) / cast(groundTable.c as FLOAT) as distribution
                        FROM (
                        SELECT groundtruth, prediction, COUNT(*) AS c
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${allSqlFilters}
                        GROUP BY groundtruth, prediction
                        )  as predictionTable
                        LEFT JOIN (
                        SELECT groundtruth, COUNT(*) AS c
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${allSqlFilters}
                        GROUP BY groundtruth
                        ) AS groundTable
                        ON groundTable.groundtruth = predictionTable.groundtruth
                    `}
                />
                {selectedCell && (
                    model.mlModelType === 'IMAGE_CLASSIFIER' ? (
                        <ImageExamples
                            groundtruth={selectedCell.groundtruth}
                            model={model}
                            onClose={() => setSelectedCell(null)}
                            prediction={selectedCell.prediction}
                        />
                    ) : model.mlModelType === 'TABULAR_CLASSIFIER' ? (
                        <TabularExamples
                            groundtruth={selectedCell.groundtruth}
                            onClose={() => setSelectedCell(null)}
                            prediction={selectedCell.prediction}
                        />
                    ) : null
                )}
            </div>
        </div>
    );
};

export default ConfusionMatrix;
