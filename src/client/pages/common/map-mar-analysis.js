import {Bar, Tooltip as ChartTooltip} from 'recharts';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {getHexColor} from 'helpers/color-helper';

const MapMarAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();

    return (
        <>
            <div className='d-flex my-3'>
                <Async
                    renderData={([iou05, iou075, iou09]) => {
                        const classNames = iou05.map((d) => {

                            return d['groundtruth.class_name'];
                        });
                        const bars = classNames.map((name) => ({
                            name,
                            iou05: (iou05.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4),
                            iou075: (iou075.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4),
                            iou09: (iou09.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4)
                        }));

                        return (
                            <BarGraph
                                bars={bars}
                                title='mAP'
                                unit='%'
                                yAxisName='mAP'
                                yAxisDomain={[0, 100]}
                                barGap={1}
                                barCategoryGap={80}
                            >
                                <ChartTooltip />
                                <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                <Bar maxBarSize={40} dataKey='iou09' fill={getHexColor('iou09')}/>
                            </BarGraph>
                        );
                    }}
                    refetchOnChanged={[allSqlFilters]}
                    fetchData={[
                        () => metricsClient('/map', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.5,
                            group_by: ['groundtruth.class_name']
                        }),
                        () => metricsClient('/map', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.75,
                            group_by: ['groundtruth.class_name']
                        }),
                        () => metricsClient('/map', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.9,
                            group_by: ['groundtruth.class_name']
                        })
                    ]}
                />
            </div>
            <div className='d-flex my-3'>
                <Async
                    renderData={([iou05, iou075, iou09]) => {
                        const classNames = iou05.map((d) => {
                            return d['groundtruth.class_name'];
                        });
                        const bars = classNames.map((name) => ({
                            name,
                            iou05: (iou05.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4),
                            iou075: (iou075.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4),
                            iou09: (iou09.find((i) => {
                                return i['groundtruth.class_name'] === name;
                            })?.value * 100).toFixed(4)
                        }));

                        return (
                            <BarGraph
                                bars={bars}
                                title='mAR'
                                unit='%'
                                yAxisName='mAR'
                                yAxisDomain={[0, 100]}
                                barGap={1}
                                barCategoryGap={80}
                            >
                                <ChartTooltip />
                                <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                <Bar maxBarSize={40} dataKey='iou09' fill={getHexColor('iou09')}/>
                            </BarGraph>
                        );
                    }}
                    refetchOnChanged={[allSqlFilters]}
                    fetchData={[
                        () => metricsClient('/mar', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.5,
                            group_by: ['groundtruth.class_name']
                        }),
                        () => metricsClient('/mar', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.75,
                            group_by: ['groundtruth.class_name']
                        }),
                        () => metricsClient('/mar', {
                            sql_filters: allSqlFilters,
                            model_type: 'DOCUMENT_PROCESSING',
                            iou_threshold: 0.9,
                            group_by: ['groundtruth.class_name']
                        })
                    ]}
                />
            </div>
        </>
    );
};

export default MapMarAnalysis;
