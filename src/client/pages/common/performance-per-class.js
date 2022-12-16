import PropTypes from 'prop-types';
import Async from 'components/async';
import {IconNames} from 'constants';
import FontIcon from 'components/font-icon';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {useState} from 'react';
import ProgressBar from 'components/progress-bar';
import DifferenceLabel from 'components/difference-labels';
import CountEvents from 'components/count-events';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {saveAs} from 'file-saver';
import useAllFilters from 'hooks/use-all-filters';
import ScatterChart from 'components/scatter-chart';
import Select from 'components/select';
import theme from 'styles/theme.module.scss';

const PerformanceBox = ({
    title = '',
    subtext,
    data,
    referenceData
}) => {
    const [sortAcs, setSortAsc] = useState(true);
    const classes = data.sort((c1, c2) => sortAcs ? c1.value - c2.value : c2.value - c1.value);

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
            <div
                style={{
                    height: '350px',
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
    const allFilters = useAllFilters();
    const model = useModel();

    return (
        <Async
            defaultData={[[], []]}
            renderData={(data) => (
                <div style={{position: 'relative'}}>
                    <OverlayTrigger overlay={<Tooltip>Download classes as CSV</Tooltip>}>
                        <IoDownloadOutline style={{position: 'absolute', right: 0, margin: 10}} className='fs-2 cursor-pointer' onClick={() => {
                            saveAs(new Blob(['class,precision\n', ...data.map((r) => `${r.label},${r.value}\n`)], {type: 'text/csv;charset=utf-8'}), 'classes.csv');
                        }}/>
                    </OverlayTrigger>
                    <PerformanceBox
                        data={data}
                        subtext={<CountEvents/>}
                        title={title}
                    />
                </div>
            )}
            fetchData={() => metricsClient(metricUrl, {
                filters: allFilters,
                per_class: true,
                model_type: model.mlModelType
            })}
            refetchOnChanged={[allFilters]}
        />
    );
};

PerformanceMetricAnalysis.propTypes = {
    metricUrl: PropTypes.string.isRequired,
    title: PropTypes.string
};

const PerformanceMetricScatterPlot = ({metricUrl, title}) => {
    const allFilters = useAllFilters();
    const model = useModel();

    return (
        <div className='border rounded p-3 pb-0'>
            <span className='text-dark bold-text fs-5'>{title}</span>
            <Async
                defaultData={[]}
                renderData={(data) => (
                    <Row className='flex-grow-1'>
                        <Col>
                            <ScatterChart
                                showAxes
                                data={data}
                                getX={(p) => p['x']}
                                getY={(p) => p['value']}
                                getColor={() => theme.primary}
                                getPointTitle={(p) => `Perf.: ${Number(p['value'].toFixed(2))}\nPopularity: ${Number(p['x'].toFixed(0))}\n\n${p['label']}`}
                            />
                        </Col>
                    </Row>
                )}
                fetchData={() => metricsClient(metricUrl, {
                    filters: allFilters,
                    per_class: true,
                    model_type: model.mlModelType
                })}
                refetchOnChanged={[allFilters, metricUrl]}
            />
        </div>
    );
};

PerformanceMetricScatterPlot.propTypes = {
    metricUrl: PropTypes.string.isRequired,
    title: PropTypes.string
};

const PerformancePerGroup = () => {
    const model = useModel();
    const [selectedLtrMetric, setSelectedLtrMetric] = useState('mean-ndcg');

    return (
        <Row className='g-2'>
            {
                model.mlModelType === 'IMAGE_CLASSIFIER' || model.mlModelType === 'TEXT_CLASSIFIER' || model.mlModelType === 'NER' ? (
                    <>
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='precision-metric' title='Precision per class'/>
                        </Col>
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='recall-metric' title='Recall per class'/>
                        </Col>
                    </>
                ) : model.mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || model.mlModelType === 'UNSUPERVISED_TEXT_CLASSIFIER' || model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? (
                    <>
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='confidence' title='Confidence per predicted class'/>
                        </Col>
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='entropy' title='Entropy per predicted class'/>
                        </Col>
                    </>
                ) : model.mlModelType === 'LEARNING_TO_RANK' ? (
                    <>
                        <Col lg={6}>
                            <PerformanceMetricAnalysis metricUrl='mean-ndcg' title='NDCG per Document' />
                        </Col>
                        <Col lg={6}>
                            <PerformanceMetricScatterPlot metricUrl={selectedLtrMetric} title={(
                                <Select value={selectedLtrMetric} onChange={setSelectedLtrMetric}>
                                    <option value='mean-ndcg'>Mean NDCG / Popularity</option>
                                    <option value='mrr'>Mean Reciprocal Rank / Popularity</option>
                                </Select>
                            )} />
                        </Col>
                    </>
                ) : `Unsupported model type: ${model.mlModelType}`
            }
        </Row>
    );
};

export default PerformancePerGroup;
