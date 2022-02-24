import PropTypes from 'prop-types';
import Async from 'components/async';
import {getName} from 'helpers/name-helper';
import {IconNames} from 'constants';
import FontIcon from 'components/font-icon';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {useEffect, useState} from 'react';
import ProgressBar from 'components/progress-bar';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import DifferenceLabel from 'components/difference-labels';
import CountEvents from 'components/count-events';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';

const PerformanceBox = ({
    title = '',
    subtext,
    data,
    referenceData,
    performanceType
}) => {
    const [sortAcs, setSortAsc] = useState(true);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (sortAcs) {
            setClasses([
                ...data.sort((c1, c2) => c2[performanceType] - c1[performanceType])
            ]);
        } else {
            setClasses([
                ...data.sort((c1, c2) => c1[performanceType] - c2[performanceType])
            ]);
        }
    }, [sortAcs, data]);

    return (
        <div className='border rounded p-3 pb-0'>
            <span className='text-dark bold-text fs-5'>{title}</span>
            {subtext && (
                <span className='text-primary mx-1'>(n={subtext})</span>
            )}
            <div className='d-flex py-3 text-secondary bold-text border-bottom'>
                <span className='w-100'>Label</span>
                <div
                    className='w-100 d-flex align-items-center'
                    onClick={() => setSortAsc(!sortAcs)}
                    style={{cursor: 'pointer'}}
                >
                    <span className='d-flex flex-column'>
                        <FontIcon
                            className='text-muted my-1 border-0'
                            icon={IconNames.ARROW_UP}
                            size={5}
                        />
                        <FontIcon
                            className='text-muted my-1 border-0'
                            icon={IconNames.ARROW_DOWN}
                            size={5}
                        />
                    </span>
                    <span className='mx-2'>{title}</span>
                </div>
            </div>
            <div className='py-5'>
                <div
                    style={{
                        height: '150px',
                        overflowY: 'scroll',
                        position: 'relative',
                        left: 10,
                        paddingRight: 10,
                        marginLeft: -10
                    }}
                >
                    {classes.map((c, i) => {
                        const classMetric = c[performanceType];
                        const classReferenceData = referenceData?.find(
                            ({label}) => label === c.label
                        );
                        const classReferenceMetric =
                            classReferenceData?.value;
                        const difference = classMetric - classReferenceMetric;

                        return (
                            <ClassRow
                                key={i}
                                name={getName(c.label)}
                                value={c.value.toFixed(4)}
                                difference={difference}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

PerformanceBox.propTypes = {
    data: PropTypes.array,
    referenceData: PropTypes.array,
    performanceType: PropTypes.string,
    subtext: PropTypes.node,
    title: PropTypes.string
};

const ClassRow = ({name = '', value, difference = 0}) => {
    return (
        <div className='d-flex align-items-center text-dark class-row'>
            <div className='w-100'>{name}</div>
            <div className='w-100 d-flex align-items-center'>
                <ProgressBar completed={(value / 1) * 100} unit='%'/>
                <DifferenceLabel
                    value={value}
                    difference={difference.toFixed(2)}
                    diffStyles={{position: 'static'}}
                />
            </div>
        </div>
    );
};

ClassRow.propTypes = {
    difference: PropTypes.number,
    maxValue: PropTypes.number,
    name: PropTypes.string,
    value: PropTypes.any
};

const PerformancePerClass = () => {
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceFilters: true});
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const model = useModel();

    return (
        <>
            <h3 className='text-dark bold-text fs-3 mb-3'>
                Performance per class
            </h3>
            <Row>
                <Col lg={6}>
                    <Async
                        defaultData={[[], []]}
                        renderData={([data, referenceData]) => (
                            <PerformanceBox
                                data={data}
                                performanceType='precision'
                                subtext={sampleSizeComponent}
                                title='Precision per class'
                                referenceData={referenceData}
                            />
                        )}
                        fetchData={[
                            () => metricsClient('precision-metric', {
                                sql_filters: allSqlFilters,
                                per_class: true,
                                model_type: model.mlModelType
                            }),
                            () => metricsClient('precision-metric', {
                                sql_filters: sqlFiltersWithModelTime,
                                per_class: true,
                                model_type: model.mlModelType
                            })
                        ]}
                        refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                    />
                </Col>
                <Col lg={6}>
                    <Async
                        defaultData={[[], []]}
                        renderData={([data, referenceData]) => (
                            <PerformanceBox
                                data={data}
                                performanceType='recall'
                                subtext={sampleSizeComponent}
                                title='Recall per class'
                                referenceData={referenceData}
                            />
                        )}
                        fetchData={[
                            () => metricsClient('recall-metric', {
                                sql_filters: allSqlFilters,
                                per_class: true,
                                model_type: model.mlModelType
                            }),
                            () => metricsClient('recall-metric', {
                                sql_filters: sqlFiltersWithModelTime,
                                per_class: true,
                                model_type: model.mlModelType
                            })
                        ]}
                        refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                    />
                </Col>
            </Row>
        </>
    );
};

export default PerformancePerClass;
