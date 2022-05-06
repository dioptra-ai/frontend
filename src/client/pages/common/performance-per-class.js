import PropTypes from 'prop-types';
import Async from 'components/async';
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
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {saveAs} from 'file-saver';

const PerformanceBox = ({
    title = '',
    subtext,
    data,
    referenceData
}) => {
    const [sortAcs, setSortAsc] = useState(true);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (sortAcs) {
            setClasses([
                ...data.sort((c1, c2) => c2.value - c1.value)
            ]);
        } else {
            setClasses([
                ...data.sort((c1, c2) => c1.value - c2.value)
            ]);
        }
    }, [sortAcs, data]);

    return (
        <div className='border rounded p-3 pb-0'>
            <span className='text-dark bold-text fs-5'>{title}</span>
            {subtext && (
                <span className='text-primary mx-1 d-inline-flex'>(n={subtext})</span>
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
                        const classReferenceData = referenceData?.find(
                            ({label}) => label === c.label
                        );
                        const classReferenceMetric =
                            classReferenceData?.value;
                        const difference = c.value - classReferenceMetric;

                        return (
                            <ClassRow
                                key={i}
                                name={c.label}
                                value={Number(c.value).toFixed(4)}
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
    subtext: PropTypes.node,
    title: PropTypes.string
};

const ClassRow = ({name = '', value, difference = 0}) => {
    return (
        <div className='d-flex align-items-center text-dark class-row'>
            <div className='w-100 text-truncate' title={name}>{name}</div>
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

const PerformanceMetricAnalysis = ({metricUrl, title}) => {
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceFilters: true});
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const model = useModel();

    return (
        <Async
            defaultData={[[], []]}
            renderData={([data, referenceData]) => (
                <div style={{position: 'relative'}}>
                    <OverlayTrigger overlay={<Tooltip>Download classes as CSV</Tooltip>}>
                        <IoDownloadOutline style={{position: 'absolute', right: 0, margin: 10}} className='fs-2 cursor-pointer' onClick={() => {
                            saveAs(new Blob(['class,precision\n', ...data.map((r) => `${r.label},${r.value}\n`)], {type: 'text/csv;charset=utf-8'}), 'classes.csv');
                        }}/>
                    </OverlayTrigger>
                    <PerformanceBox
                        data={data}
                        subtext={sampleSizeComponent}
                        title={title}
                        referenceData={referenceData}
                    />
                </div>
            )}
            fetchData={[
                () => metricsClient(metricUrl, {
                    sql_filters: allSqlFilters,
                    per_class: true,
                    model_type: model.mlModelType
                }),
                () => metricsClient(metricUrl, {
                    sql_filters: sqlFiltersWithModelTime,
                    per_class: true,
                    model_type: model.mlModelType
                })
            ]}
            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
        />
    );
};

PerformanceMetricAnalysis.propTypes = {
    metricUrl: PropTypes.string.isRequired,
    title: PropTypes.string
};

const PerformancePerClass = () => {
    const model = useModel();

    return (
        <>
            <h3 className='text-dark bold-text fs-3 mb-3'>
                Performance per class
            </h3>
            <Row>
                {
                    model.mlModelType === 'IMAGE_CLASSIFIER' || model.mlModelType === 'TEXT_CLASSIFIER' ? (
                        <>
                            <Col lg={6}>
                                <PerformanceMetricAnalysis metricUrl='precision-metric' title='Precision per class'/>
                            </Col>
                            <Col lg={6}>
                                <PerformanceMetricAnalysis metricUrl='recall-metric' title='Recall per class'/>
                            </Col>
                        </>
                    ) : model.mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' ? (
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='confidence' title='Confidence per class'/>
                        </Col>
                    ) : `Unsupported model type: ${model.mlModelType}`
                }
            </Row>
        </>
    );
};

export default PerformancePerClass;
