import PropTypes from 'prop-types';
import {useEffect, useMemo, useState} from 'react';
import {
    ResponsiveContainer,
    Scatter
} from 'recharts';
import theme from 'styles/theme.module.scss';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ScatterGraph from 'components/scatter-graph';
import SamplesPreview from 'components/samples-preview';

const LARGE_DOT_SIZE = 200;
const MEDIUM_DOT_SIZE = 100;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const ScatterGraphWithSamples = ({data, noveltyIsObsolete, isDrift}) => {
    const [shiftPressed, setShiftPressed] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const samples = selectedPoints?.map(({sample}) => sample);

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };
    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const anomalies = useMemo(() => {

        return data.filter(({anomaly}) => anomaly)
            .map((d) => ({
                size:
                      selectedPoints.find(({PCA1}) => d.PCA1 === PCA1) &&
                      selectedPoints.find(({PCA2}) => d.PCA2 === PCA2) ?
                          LARGE_DOT_SIZE :
                          MEDIUM_DOT_SIZE,
                ...d
            }));
    }, [data, selectedPoints]);

    const inliers = useMemo(() => {

        return data.filter(({anomaly}) => !anomaly)
            .map((d) => ({
                size:
                      selectedPoints.find(({PCA1}) => d.PCA1 === PCA1) &&
                      selectedPoints.find(({PCA2}) => d.PCA2 === PCA2) ?
                          LARGE_DOT_SIZE :
                          SMALL_DOT_SIZE,
                ...d
            }));
    }, [data, selectedPoints]);

    const handlePointSelect = (point) => {
        if (shiftPressed) {
            setSelectedPoints([...selectedPoints, point]);
        } else {
            setSelectedPoints([point]);
        }
    };


    return (
        <>
            <Row className='border rounded p-3 w-100 scatterGraph'>
                <Col lg={4} className='scatterGraph-leftBox' style={{userSelect: 'none'}}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ScatterGraph
                            onAreaSelected={({left, right, top, bottom}) => {
                                if (left && top && right && bottom) {
                                    const filteredData = data.filter(
                                        ({PCA1, PCA2}) => inRange(PCA1, left, right) && inRange(PCA2, top, bottom)
                                    );

                                    if (shiftPressed) {
                                        setSelectedPoints([...selectedPoints, ...filteredData]);
                                    } else {
                                        setSelectedPoints([...filteredData]);
                                    }
                                } else if (!shiftPressed) {
                                    setSelectedPoints([]);
                                }
                            }}
                        >
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name={isDrift ? 'Normal' : 'Inlier'}
                                data={inliers}
                                fill={theme.primary}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />

                            {isDrift ? (
                                <Scatter
                                    isAnimationActive={false}
                                    cursor='pointer'
                                    onClick={handlePointSelect}
                                    name={noveltyIsObsolete ? 'Obsolete' : 'Drift'}
                                    data={anomalies}
                                    fill={noveltyIsObsolete ? theme.dark : theme.success}
                                    xAxisId='PCA1'
                                    yAxisId='PCA2'
                                />
                            ) : (
                                <Scatter
                                    isAnimationActive={false}
                                    cursor='pointer'
                                    onClick={handlePointSelect}
                                    name='Outlier'
                                    data={anomalies}
                                    fill={theme.warning}
                                    xAxisId='PCA1'
                                    yAxisId='PCA2'
                                />
                            )}
                        </ScatterGraph>
                    </ResponsiveContainer>
                </Col>
                <Col lg={8} className='rounded p-3 bg-white-blue'>
                    <SamplesPreview samples={samples}/>
                </Col>
            </Row>
        </>
    );
};

ScatterGraphWithSamples.propTypes = {
    data: PropTypes.array.isRequired,
    noveltyIsObsolete: PropTypes.bool,
    isDrift: PropTypes.bool
};

export default ScatterGraphWithSamples;
