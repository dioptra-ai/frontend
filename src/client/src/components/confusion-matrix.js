import React, {useState} from 'react';
import {setupComponent} from '../helpers/component-helper';
import PropTypes from 'prop-types';
import {getName} from '../helpers/name-helper';
import BtnIcon from './btn-icon';
import {IconNames} from '../constants';
import CustomCarousel from './carousel';
import Modal from './modal';
import useModal from './../customHooks/useModal';
import TimeseriesQuery, {sql} from './timeseries-query';
import MatrixTable from './matrix-table';

const Table = ({data, onCellClick, groundtruthClasses, predictionClasses}) => {
    const getColumns = (predictionClasses) => {
        const classes = predictionClasses.map((c) => ({
            Header: getName(c),
            accessor: c,
            Cell: ({value}) => !value ? 0 : `${(value * 100).toFixed(2)} %`
        }));

        return ([{
            Header: '',
            accessor: 'groundtruth',
            Cell: ({value}) => getName(value)
        }, ...classes]);
    };

    const getTableRows = (groundtruthClasses, matrixData) => {
        const rows = groundtruthClasses.map((c) => {
            const filtered = matrixData.filter((d) => d.groundtruth === c);
            const cells = {groundtruth: c};

            filtered.forEach((e) => {
                cells[e.prediction] = e.distribution;
            });

            return cells;

        });

        return (rows);
    };

    return (
        <>
            <div className='position-relative' style={{marginLeft: '30px'}}>
                <p className='text-secondary m-0 mb-2 text-center bold-text'>Prediction</p>
                <MatrixTable columns={getColumns(predictionClasses)} data={getTableRows(groundtruthClasses, data)} onCellClick={onCellClick}/>
                <p
                    className='position-absolute text-secondary m-0 text-center bold-text'
                    style={{transform: 'rotate(-90deg)', top: '50%', left: '-70px'}}
                >
                   Ground Truth
                </p>
            </div>
        </>
    );
};

Table.propTypes = {
    data: PropTypes.array,
    groundtruthClasses: PropTypes.array,
    onCellClick: PropTypes.func,
    predictionClasses: PropTypes.array
};

const Examples = ({onClose, images}) => {
    const [exampleInModal, setExampleInModal] = useModal(false);

    return (
        <div className='bg-white-blue my-3 p-3'>
            <div className='d-flex align-items-center mb-5'>
                <p className='text-dark m-0 bold-text flex-grow-1'>Examples</p>
                <BtnIcon
                    className='text-dark border-0'
                    icon={IconNames.CLOSE}
                    onClick={onClose}
                    size={15}
                />
            </div>
            <CustomCarousel items={images} onItemClick={(example) => setExampleInModal(example)}/>
            {exampleInModal && <Modal>
                <div className='d-flex align-items-center my-3'>
                    <p className='text-white m-0 flex-grow-1'>Example</p>
                    <BtnIcon
                        className='text-white mx-2 border-0'
                        icon={IconNames.CLOSE}
                        onClick={() => setExampleInModal(null)}
                        size={15}
                    />
                </div>
                <img alt='Example' className='rounded' src={exampleInModal} width='100%'/>
            </Modal>}
        </div>

    );
};

Examples.propTypes = {
    images: PropTypes.array,
    onClose: PropTypes.func
};

const ConfusionMatrix = ({filtersStore, timeStore}) => {
    const [selectedCell, setSelectedCell] = useState(null);

    const getClasses = (data, key) => {
        const classes = [];

        data.forEach((obj) => {
            if (classes.indexOf(obj[key]) === -1 && obj[key]) {
                classes.push(obj[key]);
            }
        });

        return classes;
    };

    return (

        <div className='my-5'>
            <h3 className='text-dark bold-text fs-3 mb-3'>Confusion matrix</h3>
            <div className='border rounded p-3'>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <Table
                            data={data}
                            groundtruthClasses={getClasses(data, 'groundtruth')}
                            onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})}
                            predictionClasses = {getClasses(data, 'prediction')}
                        />
                    )}
                    sql={sql`
                        SELECT
                        predictionTable.groundtruth,
                        predictionTable.prediction,
                        cast(predictionTable.c as FLOAT) / cast(groundTable.c as FLOAT) as distribution
                        FROM (
                        SELECT groundtruth, prediction, COUNT(*) AS c
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                        GROUP BY groundtruth, prediction
                        )  as predictionTable
                        LEFT JOIN (
                        SELECT groundtruth, COUNT(*) AS c
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                        GROUP BY groundtruth
                        ) AS groundTable
                        ON groundTable.groundtruth = predictionTable.groundtruth
                    `}
                />
                {selectedCell && <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <Examples
                            images={data.map((x) => x['feature.image_url'].replace(/"/g, ''))}
                            onClose={() => setSelectedCell(null)}
                        />
                    )}
                    sql={sql`
                        SELECT distinct "feature.image_url"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE groundtruth = '${selectedCell.groundtruth}' AND prediction = '${selectedCell.prediction}'
                        AND ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                        LIMIT 20
                    `}
                />}
            </div>
        </div>
    );
};

ConfusionMatrix.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object
};

export default setupComponent(ConfusionMatrix);
