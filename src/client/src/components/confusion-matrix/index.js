import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {getName} from 'helpers/name-helper';
import MatrixTable from 'components/matrix-table';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ImageExamples from './image-examples';
import TabularExamples from './tabular-examples';
import useModel from 'customHooks/use-model';
import DifferenceLabel from 'components/difference-labels';
import Async from 'components/async';
import Select from 'components/select';
import Col from 'react-bootstrap/Col';
import baseJSONClient from 'clients/base-json-client';

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
    const allSqlFilters = useAllSqlFilters({__REMOVE_ME__excludeOrgId: true});
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true, __REMOVE_ME__excludeOrgId: true});
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

    return (
        <div className='my-5'>
            <h3 className='text-dark bold-text fs-3 mb-3'>Confusion matrix</h3>
            <div className='border rounded p-3'>
                {model.mlModelType === 'DOCUMENT_PROCESSING' ? (
                    <Col lg={{span: 3, offset: 9}}>
                        <Select
                            options={[
                                {name: 'iou >= 0.5', value: 0.5},
                                {name: 'iou >= 0.75', value: 0.75},
                                {name: 'iou >= 0.95', value: 0.95}
                            ]}
                            initialValue={iou}
                            onChange={(val) => setIou(Number(val))}
                        />
                    </Col>
                ) : null}
                <Async
                    renderData={([data, rangeData]) => (
                        <Table
                            data={data}
                            groundtruthClasses={getClasses(data, 'groundtruth')}
                            onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})
                            }
                            predictionClasses={getClasses(data, 'prediction')}
                            referenceData={rangeData}
                        />
                    )}
                    fetchData={[
                        () => baseJSONClient('/api/metrics/confusion-matrix', {
                            method: 'post',
                            body: {
                                sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                                    `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters
                            }
                        }),
                        () => baseJSONClient('/api/metrics/confusion-matrix', {
                            method: 'post',
                            body: {
                                sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                                    `cast("iou" as FLOAT) > ${iou} AND ${sqlFiltersWithModelTime}` : sqlFiltersWithModelTime
                            }
                        })
                    ]}
                    refetchOnChanged={[iou, allSqlFilters, sqlFiltersWithModelTime]}
                />
                {selectedCell &&
          (model.mlModelType === 'IMAGE_CLASSIFIER' || model.mlModelType === 'DOCUMENT_PROCESSING' ? (
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
