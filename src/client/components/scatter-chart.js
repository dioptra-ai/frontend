/* eslint-disable no-invalid-this */
import {PropTypes} from 'prop-types';
import React, {useRef} from 'react';
import * as fc from 'd3fc';
import * as d3 from 'd3';
import {nanoid} from 'nanoid';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import {IoChevronForwardSharp, IoCloseCircleOutline} from 'react-icons/io5';

import theme from 'styles/theme.module.scss';

const inRange = (num, min, max) => num >= min && num <= max;

// See: https://github.com/d3fc/d3fc/blob/master/packages/d3fc-brush/src/brush.js
const tranformBrushSelection = (selection, xScale, yScale) => {
    const invertRange = (range) => [range[1], range[0]];
    const xMapping = d3.scaleLinear().domain(xScale.range());
    const yMapping = d3.scaleLinear().domain(invertRange(yScale.range()));
    const mappedSelection = [
        [xMapping(selection[0][0]), yMapping(selection[0][1])],
        [xMapping(selection[1][0]), yMapping(selection[1][1])]
    ];

    const f = d3.scaleLinear().domain(xScale.domain());
    const xDomain = [
        f.invert(mappedSelection[0][0]),
        f.invert(mappedSelection[1][0])
    ];
    const g = d3.scaleLinear().domain(invertRange(yScale.domain()));
    const yDomain = [
        g.invert(mappedSelection[1][1]),
        g.invert(mappedSelection[0][1])
    ];

    return {xDomain, yDomain};
};
const ScatterChart = ({
    data, referenceData, onSelectedDataChange, showAxes,
    getX = (d) => d.x, getY = (d) => d.y, getColor, getPointTitle, isDatapointSelected,
    chartId = `chart-${nanoid()}`, width = '100%', height = '100%'
}) => {
    const pruneData = (data) => data.reduce((acc, d) => {
        const x = getX(d);
        const y = getY(d);

        if (!acc[x]) {
            acc[x] = {};
        }

        if (!acc[x][y]) {
            acc[x][y] = d;
        }

        return acc;
    }, {});

    const prunedData = Object.values(pruneData(data)).map((d) => Object.values(d)).flat();
    const prunedReferenceData = referenceData ? Object.values(pruneData(referenceData)).map((d) => Object.values(d)).flat() : [];
    const brushRef = useRef(null);
    const brush = d3.brush().keyModifiers(false)
        .on('start', function () {
            if (brushRef.current !== this) {
                d3.select(brushRef.current).call(brush.move, null);
                brushRef.current = this;
            }
        })
        .on('end', function(e) {
            if (e.selection) {
                const {
                    xDomain: [left, right],
                    yDomain: [top, bottom]
                } = tranformBrushSelection(e.selection, xScale, yScale);
                const filteredData = data.filter((p) => {

                    return inRange(getX(p), left, right) && inRange(getY(p), top, bottom);
                });

                onSelectedDataChange?.([...filteredData], e.sourceEvent);

                d3.select(brushRef.current).call(brush.move, null);
            } else if (e.sourceEvent) {
                onSelectedDataChange?.([], e.sourceEvent);
            }
        });
    const xExtent = fc.extentLinear().pad([0.10, 0.10]).accessors([getX]);
    const yExtent = fc.extentLinear().pad([0.10, 0.10]).accessors([getY]);
    const xScale = d3.scaleLinear().domain(xExtent(prunedData.concat(prunedReferenceData)));
    const yScale = d3.scaleLinear().domain(yExtent(prunedData.concat(prunedReferenceData)));
    const svgPointSeries = fc.seriesSvgPoint()
        .crossValue(getX)
        .mainValue(getY)
        .size((d) => isDatapointSelected?.(d) ? 30 : 15)
        .decorate((selection) => {
            selection.style('fill', (d) => getColor?.(d) || '#000');
            selection.style('stroke', (d) => getColor ? d3.color(getColor(d)).darker() : '#000');
            selection.on('click', (e, points) => {
                e.stopPropagation();
                onSelectedDataChange?.([Array(points).flat()[0]], e);
            });
            if (getPointTitle) {
                selection.append('title').text((d) => getPointTitle(d));
            }
        });
    const svgreferencePointSeries = fc.seriesSvgPoint()
        .crossValue(getX)
        .mainValue(getY)
        .size(15)
        .decorate((selection) => {
            selection.style('fill', '#800080');
            selection.style('stroke', '#800080');
        });
    const svgGridSeries = fc.annotationSvgGridline()
        .xScale(xScale)
        .yScale(yScale)
        .xDecorate((s) => s.attr('pointer-events', 'none').attr('stroke', theme.light))
        .yDecorate((s) => s.attr('pointer-events', 'none').attr('stroke', theme.light));
    const xAxis = fc.axisBottom(xScale);
    const yAxis = fc.axisLeft(yScale);
    const xAxisJoin = fc.dataJoin('g', 'x-axis');
    const yAxisJoin = fc.dataJoin('g', 'y-axis');
    const svgSeries = fc.seriesSvgMulti().series([svgGridSeries, svgPointSeries]);
    const svgreferenceSeries = fc.seriesSvgMulti().series([svgreferencePointSeries]);
    const renderData = () => {
        const chart = fc.chartCartesian(xScale, yScale).svgPlotArea(svgSeries);
        const referenceChart = fc.chartCartesian(xScale, yScale).svgPlotArea(svgreferenceSeries);

        if (showAxes) {
            const container = document.querySelector('d3fc-svg');
            const svg = d3.select(container).select('svg');

            d3.select(container)
                .on('draw', () => {
                    svg.call(svgGridSeries);
                })
                .on('measure', (event) => {
                    const {width, height} = event.detail;

                    xScale.range([0, width]);
                    yScale.range([height, 0]);
                    xAxisJoin(svg, (d) => [d])
                        .attr('transform', `translate(0, ${height})`)
                        .call(xAxis)
                        .call((g) => g.select('.domain').remove());
                    yAxisJoin(svg, (d) => [d])
                        .call(yAxis)
                        .call((g) => g.select('.domain').remove());
                });
        }
        d3.select(`#${chartId}`)
            .datum(prunedData.sort((p1) => isDatapointSelected?.(p1) ? 1 : -1)) // Selected => on top.
            .call(chart);

        d3.select(`#${chartId}-reference`)
            .datum(prunedReferenceData)
            .call(referenceChart);

        if (onSelectedDataChange) {
            d3.select(`#${chartId} svg`).call(brush);
        }
    };

    React.useEffect(renderData, [prunedData, prunedReferenceData]);

    return (
        <>
            <div id={chartId} style={{width, height, minHeight: 400}} onClick={(e) => onSelectedDataChange?.([], e)} />
            <div id={`${chartId}-reference`} style={{
                width, height, minHeight: 400,
                position: 'absolute',
                inset: 0,
                opacity: 0.5,
                pointerEvents: 'none'
            }} />
            <style>{`
                .point:hover {
                    cursor: ${onSelectedDataChange ? 'pointer' : getPointTitle ? 'help' : 'default'};
                }
                .x-axis {
                    height: 0 !important;
                }
                .y-axis {
                    width: 0 !important;
                }
                d3fc-group.cartesian-chart {
                    overflow: visible !important;
                    ${showAxes ? 'padding: 10px;' : ''}
                }
                d3fc-group.cartesian-chart>.plot-area {
                    overflow: visible !important;
                }
            `}</style>
        </>
    );
};

ScatterChart.propTypes = {
    data: PropTypes.array.isRequired,
    referenceData: PropTypes.array,
    getX: PropTypes.func,
    getY: PropTypes.func,
    getColor: PropTypes.func,
    getPointTitle: PropTypes.func,
    isDatapointSelected: PropTypes.func,
    chartId: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSelectedDataChange: PropTypes.func,
    showAxes: PropTypes.bool
};

export default ScatterChart;

export const ScatterSearch = ({isSearchMatch, data, onSelectedDataChange}) => {
    const [search, setSearch] = React.useState('');
    const searchData = search ? data.filter((d) => isSearchMatch(d, search)) : [];

    return (
        <Row>
            <Col className='position-relative' sm={9}>
                <IoCloseCircleOutline
                    className='position-absolute fs-5 text-dark me-4 cursor-pointer'
                    style={{top: '50%', transform: 'translateY(-50%)', right: 0}}
                    onClick={() => setSearch('')}
                />
                <Form.Control placeholder='Find datapoints' value={search} onChange={(e) => setSearch(e.target.value)}/>
            </Col>
            <Col className='text-dark d-flex align-items-center'>
                {search ? (
                    <div className='cursor-pointer' onClick={(e) => onSelectedDataChange?.(searchData, e)}>
                        <IoChevronForwardSharp/>&nbsp;<span className='text-decoration-underline'>{searchData.length.toLocaleString()} results</span>
                    </div>
                ) : null}
            </Col>
        </Row>
    );
};

ScatterSearch.propTypes = {
    data: PropTypes.array.isRequired,
    isSearchMatch: PropTypes.func.isRequired,
    onSelectedDataChange: PropTypes.func
};
