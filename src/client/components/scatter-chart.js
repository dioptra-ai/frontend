/* eslint-disable no-invalid-this */
import {PropTypes} from 'prop-types';
import React, {useRef} from 'react';
import * as fc from 'd3fc';
import * as d3 from 'd3';
import {nanoid} from 'nanoid';

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
    data, onAreaSelected, onScatterClick,
    getX = (d) => d.x, getY = (d) => d.y, getColor, isProminent,
    chartId = `chart-${nanoid()}`, width = '100%', height = '95vh'
}) => {
    const brushRef = useRef(null);
    const svgGridSeries = fc.annotationSvgGridline();
    const brush = d3.brush().keyModifiers(false)
        .on('start', function () {
            if (brushRef.current !== this) {
                d3.select(brushRef.current).call(brush.move, null);
                brushRef.current = this;
            }
        })
        .on('end', function(e) {
            if (e.selection) {
                const {xDomain, yDomain} = tranformBrushSelection(e.selection, xScale, yScale);

                onAreaSelected({
                    left: xDomain[0],
                    right: xDomain[1],
                    top: yDomain[0],
                    bottom: yDomain[1]
                });
                d3.select(brushRef.current).call(brush.move, null);
            }
        });
    const xExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getX]);
    const yExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getY]);
    const xScale = d3.scaleLinear().domain(xExtent(data));
    const yScale = d3.scaleLinear().domain(yExtent(data));
    const svnPointSeries = fc.seriesSvgPoint()
        .crossValue(getX)
        .mainValue(getY)
        .size((d) => isProminent?.(d) ? 100 : 30)
        .decorate((selection) => {
            selection.style('fill', (d) => getColor?.(d) || '#000');
            selection.style('stroke', (d) => getColor ? d3.color(getColor(d)).darker() : '#000');
            selection.on('click', (e, points) => {
                e.stopPropagation();
                onScatterClick(Array(points).flat()[0]);
            });
        });
    const svgSeries = fc.seriesSvgMulti().series([svgGridSeries, svnPointSeries]);
    const renderData = () => {
        const chart = fc.chartCartesian(xScale, yScale).svgPlotArea(svgSeries);

        d3.select(`#${chartId}`)
            .datum(data)
            .call(chart);

        d3.select(`#${chartId} svg`).call(brush);
    };

    React.useEffect(renderData, [data]);

    return (
        <>
            <div id={chartId} style={{width, height}} onClick={() => onScatterClick()}/>
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
    isProminent: PropTypes.func,
    chartId: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    onAreaSelected: PropTypes.func.isRequired,
    onScatterClick: PropTypes.func.isRequired
};

export default ScatterChart;
