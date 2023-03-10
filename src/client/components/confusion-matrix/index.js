import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

import MatrixTable from 'components/matrix-table';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ImageExamples from './image-examples';
import TabularExamples from './tabular-examples';
import ArrayLabelsExamples from './array-labels-examples';
import useModel from 'hooks/use-model';
import DifferenceLabel from 'components/difference-labels';
import Async from 'components/async';
import Select from 'components/select';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import useAllFilters from 'hooks/use-all-filters';

const Table = ({
    data,
    referenceData,
    onCellClick,
    classes
}) => {
    const classColumns = classes.sort().map((c) => ({
        Header: c,
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
            Cell: ({value}) => value
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
                value: e.value,
                difference: e.value - referenceDataForCell?.value
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
    const allFilters = useAllFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceFilters: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const [iou, setIou] = useState('0.5');

    return (
        <div className='my-3'>
            <div className='border rounded p-3'>
                <Row>
                    <Col>
                        <div className='text-dark fw-bold fs-4 flex-grow-1'>
                            Confusion Matrix
                            <span className='text-primary mx-1 d-inline-flex'>(n=<CountEvents />)</span>
                        </div>
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
                                    defaultValue={iou}
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
                    fetchData={() => Promise.all([
                        metricsClient('confusion-matrix', {
                            iou,
                            filters: allFilters,
                            model_type: model.mlModelType,
                            limit: 101
                        }),
                        metricsClient('confusion-matrix', {
                            iou,
                            filters: allFilters, // TODO: implement useAllFilters({useReferenceFilters: true})
                            model_type: model.mlModelType,
                            limit: 101
                        })
                    ])}
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
                        ) : model.mlModelType === 'NER' ? (
                            <ArrayLabelsExamples
                                groundtruth={selectedCell.groundtruth}
                                prediction={selectedCell.prediction}
                                onClose={() => setSelectedCell(null)}
                            />
                        ) : null
                ) : null}
            </div>
        </div>
    );
};

export default ConfusionMatrix;
