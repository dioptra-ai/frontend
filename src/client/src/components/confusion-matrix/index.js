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
import Row from 'react-bootstrap/Row';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';

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
                const displayTruncatedValue = (value * 100).toFixed(2);
                const truncatedValue = Number(displayTruncatedValue);
                const displayValue = value ? (
                    truncatedValue ? `${displayTruncatedValue} %` : `< ${displayTruncatedValue} %`
                ) : '-';
                const truncatedDifference = Number((difference * 100).toFixed(2));

                return (
                    <>
                        <span>{displayValue}</span>
                        <DifferenceLabel difference={truncatedDifference}/>
                    </>
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
        <div className='d-flex'>
            <div className='position-relative' style={{width: 30}}>
                <p
                    className='position-absolute text-secondary m-0 text-center bold-text'
                    style={{transform: 'rotate(-90deg)', top: '50%', left: -85, width: 200}}
                >
                    Ground Truth
                </p>
            </div>
            <div className='position-relative' style={{
                overflow: 'auto', width: '100%', maxHeight: '98vh'
            }}>
                <p
                    className='text-secondary m-0 mb-2 text-center bold-text position-sticky'
                    style={{left: 0}}
                >Prediction</p>
                <MatrixTable columns={columns} data={rows} onCellClick={onCellClick} />
            </div>
        </div>
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
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceRange: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>); // Use this component to get # of events
    const [iou, setIou] = useState('0.5');
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
        <div className='my-3'>
            <div className='border rounded p-3'>
                <Row>
                    <Col>
                        <p className='text-dark fw-bold fs-4 flex-grow-1'>
                            Confusion Matrix
                            <span className='text-primary mx-1'>(n={sampleSizeComponent})</span>
                        </p>
                    </Col>
                    {model.mlModelType === 'DOCUMENT_PROCESSING' ? (
                        <Col lg={{span: 3}}>
                            <Select
                                options={[
                                    {name: 'iou >= 0.5', value: '0.5'},
                                    {name: 'iou >= 0.75', value: '0.75'},
                                    {name: 'iou >= 0.95', value: '0.95'}
                                ]}
                                initialValue={iou}
                                onChange={(val) => setIou(Number(val))}
                            />
                        </Col>
                    ) : null}
                </Row>
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
                        () => metricsClient('confusion-matrix', {
                            sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                                `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                            model_type: model.mlModelType
                        }),
                        () => metricsClient('confusion-matrix', {
                            sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                                `cast("iou" as FLOAT) > ${iou} AND ${sqlFiltersWithModelTime}` : sqlFiltersWithModelTime,
                            model_type: model.mlModelType
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
                  iou={Number(iou)}
              />
          ) : model.mlModelType === 'TABULAR_CLASSIFIER' ? (
              <TabularExamples
                  groundtruth={selectedCell.groundtruth}
                  onClose={() => setSelectedCell(null)}
                  prediction={selectedCell.prediction}
              />
          ) : model.mlModelType === 'TEXT_CLASSIFIER' ? (
              <TabularExamples
                  groundtruth={selectedCell.groundtruth}
                  onClose={() => setSelectedCell(null)}
                  prediction={selectedCell.prediction}
                  previewColumns={['confidence', 'groundtruth', 'prediction', 'tags', /^text$/, 'features']}
              />
          ) : null)}
            </div>
        </div>
    );
};

export default ConfusionMatrix;
