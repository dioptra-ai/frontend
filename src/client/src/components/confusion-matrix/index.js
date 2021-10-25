import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {getName} from 'helpers/name-helper';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import MatrixTable from 'components/matrix-table';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ImageExamples from './image-examples';
import TabularExamples from './tabular-examples';
import useModel from 'customHooks/use-model';
import DifferenceLabel from 'components/difference-labels';
import Select from 'components/select';
import Col from 'react-bootstrap/Col';

const Table = ({
    data,
    referenceData,
    onCellClick,
    groundtruthClasses,
    predictionClasses
}) => {
    const classes = predictionClasses.sort().map((c) => ({
        Header: getName(c),
        accessor: c,
        Cell: Object.assign(
            ({value: cell = {}}) => {
                const {value = 0, difference = 0} = cell;

                return (
                    <DifferenceLabel
                        value={`${(value * 100).toFixed(2)} %`}
                        difference={(difference * 100).toFixed(2)}
                    />
                );
            },
            {displayName: 'Cell'}
        )
    }));

    const columns = [
        {
            Header: '',
            accessor: 'groundtruth',
            Cell: ({value}) => getName(value)
        },
        ...classes
    ];

    const rows = groundtruthClasses.sort().map((c) => {
        const filtered = data.filter((d) => d.groundtruth === c);
        const referenceDataForClass = referenceData.filter((d) => d.groundtruth === c);

        const cells = {groundtruth: c};

        filtered.forEach((e) => {
            const referenceDataForCell = referenceDataForClass.find(
                (d) => d.prediction === e.prediction
            );

            cells[e.prediction] = {
                value: e.distribution,
                difference: e.distribution - referenceDataForCell?.distribution
            };
        });

        return cells;
    });

    return (
        <>
            <div className='position-relative' style={{marginLeft: '30px'}}>
                <p className='text-secondary m-0 mb-2 text-center bold-text'>Prediction</p>
                <MatrixTable columns={columns} data={rows} onCellClick={onCellClick} />
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
    referenceData: PropTypes.array,
    groundtruthClasses: PropTypes.array,
    onCellClick: PropTypes.func,
    predictionClasses: PropTypes.array
};

const ConfusionMatrix = () => {
    const [selectedCell, setSelectedCell] = useState(null);
    const model = useModel();
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const [iou, setIou] = useState(0.5);

    const getClasses = (data, key) => {
        const classes = [];

        data.forEach((obj) => {
            if (classes.indexOf(obj[key]) === -1 && obj[key]) {
                classes.push(obj[key]);
            }
        });

        return classes;
    };

    const generateQuery = (filters) => {
        switch (model.mlModelType) {
        case 'DOCUMENT_PROCESSING':
            return `SELECT
                predictionTable.groundtruth,
                predictionTable.prediction,
                cast(predictionTable.c as FLOAT) / cast(groundTable.c as FLOAT) as distribution
            FROM (
                SELECT "bboxes.groundtruth" as groundtruth, 
                    "bboxes.prediction" as prediction, 
                    COUNT(*) AS c
                FROM "dioptra-gt-combined-eventstream"
                WHERE cast("bboxes.iou" as FLOAT) > ${iou} AND ${filters}
                GROUP BY "bboxes.groundtruth", "bboxes.prediction"
                ORDER BY "bboxes.groundtruth", "bboxes.groundtruth"
            )  as predictionTable
            LEFT JOIN (
                SELECT "bboxes.groundtruth" as groundtruth,
                    COUNT(*) AS c
                FROM "dioptra-gt-combined-eventstream"
                WHERE cast("bboxes.iou" as FLOAT) >= ${iou} AND ${filters}
                GROUP BY "bboxes.groundtruth"
            ) AS groundTable
            ON groundTable.groundtruth = predictionTable.groundtruth`;
        default:
            return `SELECT
                predictionTable.groundtruth,
                predictionTable.prediction,
                cast(predictionTable.c as FLOAT) / cast(groundTable.c as FLOAT) as distribution
                FROM (
                    SELECT groundtruth, prediction, COUNT(*) AS c
                    FROM "dioptra-gt-combined-eventstream"
                    WHERE ${filters}
                    GROUP BY groundtruth, prediction
                    ORDER BY groundtruth, prediction
                )  as predictionTable
                LEFT JOIN (
                    SELECT groundtruth, COUNT(*) AS c
                    FROM "dioptra-gt-combined-eventstream"
                    WHERE ${filters}
                    GROUP BY groundtruth
                ) AS groundTable
                ON groundTable.groundtruth = predictionTable.groundtruth`;
        }
    };

    return (
        <div className='my-5'>
            <h3 className='text-dark bold-text fs-3 mb-3'>Confusion matrix</h3>
            <div className='border rounded p-3'>
                {model.mlModelType === 'DOCUMENT_PROCESSING' ? (
                    <Col lg={{span: 3, offset: 9}}>
                        <Select
                            options={[
                                {name: 'iou=0.5', value: 0.5},
                                {name: 'iou=0.75', value: 0.75},
                                {name: 'iou=0.95', value: 0.95}
                            ]}
                            initialValue={iou}
                            onChange={(val) => setIou(Number(val))}
                        />
                    </Col>
                ) : null}

                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(rangeData) => (
                                <Table
                                    data={data}
                                    groundtruthClasses={getClasses(data, 'groundtruth')}
                                    onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})
                                    }
                                    predictionClasses={getClasses(data, 'prediction')}
                                    referenceData={rangeData}
                                />
                            )}
                            sql={sql`${generateQuery(sqlFiltersWithModelTime)}`}
                        />
                    )}
                    sql={sql`${generateQuery(allSqlFilters)}`}
                />
                {selectedCell &&
          (model.mlModelType === 'IMAGE_CLASSIFIER' ? (
              <ImageExamples
                  groundtruth={selectedCell.groundtruth}
                  model={model}
                  onClose={() => setSelectedCell(null)}
                  prediction={selectedCell.prediction}
                  iou={iou}
              />
          ) : model.mlModelType === 'TABULAR_CLASSIFIER' ? (
              <TabularExamples
                  groundtruth={selectedCell.groundtruth}
                  onClose={() => setSelectedCell(null)}
                  prediction={selectedCell.prediction}
              />
          ) : null)}
            </div>
        </div>
    );
};

export default ConfusionMatrix;
