import {PropTypes} from 'prop-types';
import React from 'react';
import * as fc from 'd3fc';
import * as d3 from 'd3';
import {nanoid} from 'nanoid';

const ScatterChart = ({data, getX = (d) => d.x, getY = (d) => d.y, getColor, chartId = `chart-${nanoid()}`, width = '100%', height = '95vh'}) => {
    const svgGridSeries = fc.annotationSvgGridline();
    const brushSeries = fc.brush().on('end', (e) => {
        if (e.selection) {
            console.log('brush!', e);
            renderData();
        }
    });
    const xExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getX]);
    const yExtent = fc.extentLinear().pad([0.05, 0.05]).accessors([getY]);
    const svnPointSeries = fc.seriesSvgPoint()
        .crossValue(getX)
        .mainValue(getY)
        .decorate((selection) => {

            selection.style('fill', (d) => getColor?.(d) || '#000');
        });
    const svgSeries = fc.seriesSvgMulti().series([svgGridSeries, svnPointSeries, brushSeries])
        .mapping((data, index, series) => {
            switch (series[index]) {
            case brushSeries:
            // the brush is transient, so always has null data
                return null;
            default:
                return data;
            }
        });
    const renderData = () => {
        const xScale = d3.scaleLinear().domain(xExtent(data));
        const yScale = d3.scaleLinear().domain(yExtent(data));
        const chart = fc.chartCartesian(xScale, yScale).svgPlotArea(svgSeries);

        d3.select(`#${chartId}`)
            .datum(data)
            .call(chart);
    };

    React.useEffect(renderData, [data]);

    return <div id={chartId} style={{width, height}}/>;
};

ScatterChart.propTypes = {
    data: PropTypes.array.isRequired,
    getX: PropTypes.func,
    getY: PropTypes.func,
    getColor: PropTypes.func,
    chartId: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string
};

export default ScatterChart;
