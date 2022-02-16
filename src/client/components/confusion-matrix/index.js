import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

import {getName} from 'helpers/name-helper';
import MatrixTable from 'components/matrix-table';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ImageExamples from './image-examples';
import TabularExamples from './tabular-examples';
import useModel from 'hooks/use-model';
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
    classes
}) => {
    const classColumns = classes.sort().map((c) => ({
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
        ...classColumns
    ];

    const rows = classes.sort().map((c) => {
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
    onCellClick: PropTypes.func,
    classes: PropTypes.array
};

const ConfusionMatrix = () => {
    const [selectedCell, setSelectedCell] = useState(null);
    const model = useModel();
    const allSqlFilters = useAllSqlFilters({__REMOVE_ME__excludeOrgId: true});
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceFilters: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>); // Use this component to get # of events
    const [iou, setIou] = useState('0.5');

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
                    {model.mlModelType === 'DOCUMENT_PROCESSING' ||
                        model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? (
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
                    renderData={([data, rangeData]) => {
                        const allClasses = Array.from(data.reduce((agg, row) => {
                            const groundtruth = row['groundtruth'];
                            const prediction = row['prediction'];

                            if (groundtruth) {
                                agg.add(groundtruth);
                            }

                            if (prediction) {
                                agg.add(prediction);
                            }

                            return agg;
                        }, new Set()));

                        return (
                            <>
                                {
                                    data.length > 100 ? (
                                        <Alert variant='warning'>
                                            This matrix is only showing the first 100 classes found. Try filtering down and/or narrowing the time range to see all values.
                                        </Alert>
                                    ) : null
                                }
                                <Table
                                    data={data}
                                    classes={allClasses}
                                    onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})
                                    }
                                    referenceData={rangeData}
                                />
                            </>
                        );
                    }}
                    fetchData={[
                        () => metricsClient('confusion-matrix', {
                            sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ||
                                    model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
                                `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                            model_type: model.mlModelType
                        }),
                        () => metricsClient('confusion-matrix', {
                            sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ||
                                    model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
                                `cast("iou" as FLOAT) > ${iou} AND ${sqlFiltersWithModelTime}` : sqlFiltersWithModelTime,
                            model_type: model.mlModelType
                        })
                    ]}
                    refetchOnChanged={[iou, allSqlFilters, sqlFiltersWithModelTime]}
                />
                {selectedCell ? (
                    (model.mlModelType === 'IMAGE_CLASSIFIER' ||
                        model.mlModelType === 'DOCUMENT_PROCESSING' ||
                        model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION'
                    ) ? (
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
                        ) : null
                ) : null}
            </div>
        </div>
    );
};

export default ConfusionMatrix;
