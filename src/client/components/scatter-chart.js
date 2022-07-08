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
    data, onSelectedDataChange,
    getX = (d) => d.x, getY = (d) => d.y, getColor, isDatapointSelected,
    chartId = `chart-${nanoid()}`, width = '100%', height = '100%'
}) => {
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

                onSelectedDataChange([...filteredData], e.sourceEvent);

                d3.select(brushRef.current).call(brush.move, null);
            }
        });
    const xExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getX]);
    const yExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getY]);
    const xScale = d3.scaleLinear().domain(xExtent(data));
    const yScale = d3.scaleLinear().domain(yExtent(data));
    const svgPointSeries = fc.seriesSvgPoint()
        .crossValue(getX)
        .mainValue(getY)
        .size((d) => isDatapointSelected?.(d) ? 100 : 30)
        .decorate((selection) => {
            selection.style('fill', (d) => getColor?.(d) || '#000');
            selection.style('stroke', (d) => getColor ? d3.color(getColor(d)).darker() : '#000');
            selection.on('click', (e, points) => {
                e.stopPropagation();
                onSelectedDataChange([Array(points).flat()[0]], e);
            });
        });
    const svgGridSeries = fc.annotationSvgGridline()
        .xDecorate((s) => s.attr('pointer-events', 'none').attr('stroke', theme.light))
        .yDecorate((s) => s.attr('pointer-events', 'none').attr('stroke', theme.light));
    const svgSeries = fc.seriesSvgMulti().series([svgGridSeries, svgPointSeries]);
    const renderData = () => {
        const chart = fc.chartCartesian(xScale, yScale).svgPlotArea(svgSeries);

        d3.select(`#${chartId}`)
            .datum(data.sort((p1) => isDatapointSelected?.(p1) ? 1 : -1)) // Selected => on top.
            .call(chart);

        d3.select(`#${chartId} svg`).call(brush);
    };

    React.useEffect(renderData, [data]);

    return (
        <>
            <div className='position-relative'>
                <div className='position-absolute text-primary fs-6 p-3' style={{
                    top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none'
                }}>
                    (n={Number(data.length).toLocaleString()})
                </div>
            </div>
            <div id={chartId} style={{width, height, minHeight: 400}} onClick={(e) => onSelectedDataChange([], e)}/>
            <style>{`
                .point:hover {
                    cursor: pointer;
                }
                .x-axis {
                    height: 0 !important;
                }
                .y-axis {
                    width: 0 !important;
                }
            `}</style>
        </>
    );
};

ScatterChart.propTypes = {
    data: PropTypes.array.isRequired,
    getX: PropTypes.func,
    getY: PropTypes.func,
    getColor: PropTypes.func,
    isDatapointSelected: PropTypes.func,
    chartId: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    onSelectedDataChange: PropTypes.func.isRequired
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
                {searchData.length ? (
                    <div className='cursor-pointer' onClick={(e) => onSelectedDataChange(searchData, e)}>
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
    onSelectedDataChange: PropTypes.func.isRequired
};
