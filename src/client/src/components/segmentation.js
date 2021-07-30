import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import Table from './table';
import Modal from './modal';
import useModal from '../customHooks/useModal';
import {SegmentationFeatures, SegmentationTags} from '../enums/segmentation';
import {Area, AreaChart, Bar, BarChart, ResponsiveContainer} from 'recharts';
import {getHexColor} from 'helpers/color-helper';
import theme from '../styles/theme.module.scss';

const AddColumnModal = ({onCancel, onApply, selected}) => {
    const [selectedColumns, setSelectedColumns] = useState(selected);

    const checkIfSelected = (value) => {
        const cols = selected.map((c) => c.value);

        if (cols.indexOf(value) !== -1) {
            return true;
        } else {
            return false;
        }
    };

    const handleChange = (e, col) => {
        if (e.target.checked) {
            setSelectedColumns([...selectedColumns, col]);

        } else {
            const updatedCols = selectedColumns.filter((c) => c.value !== col.value);

            setSelectedColumns(updatedCols);
        }
    };

    return (
        <Modal className='bg-white rounded p-4'>
            <p className='text-dark fw-bold fs-4 pb-3 mb-4 border-bottom border-mercury'>
                Add or remove columns from the table
            </p>
            <div className='d-flex flex-column mb-4'>
                <p className='text-dark fw-bold fs-6'>FEATURES</p>
                {SegmentationFeatures.map((feature, i) => (
                    <label className='checkbox my-2 fs-6' key={i}>
                        <input
                            defaultChecked={checkIfSelected(feature.value)}
                            onChange={(e) => handleChange(e, feature)}
                            type='checkbox'/>
                        <span className='fs-6'>{feature.name}</span>
                    </label>
                ))}
            </div>
            <div className='d-flex flex-column mb-4 fs-6'>
                <p className='text-dark fw-bold fs-6'>TAGS</p>
                {SegmentationTags.map((tag, i) => (
                    <label className='checkbox my-2' key={i}>
                        <input
                            defaultChecked={checkIfSelected(tag.value)}
                            onChange={(e) => handleChange(e, tag)}
                            type='checkbox' />
                        <span className='fs-6'>{tag.name}</span>
                    </label>
                ))}
            </div>
            <div className='border-top border-mercury py-3'>
                <Button
                    className='text-white fw-bold fs-6 px-5 py-2'
                    onClick={() => onApply(selectedColumns)}
                    variant='primary'
                >
                        APPLY
                </Button>
                <Button
                    className='text-secondary fw-bold fs-6 px-5 py-2 mx-3'
                    onClick={onCancel}
                    variant='light-blue'
                >
                        CANCEL
                </Button>
            </div>
        </Modal>
    );
};

AddColumnModal.propTypes = {
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    selected: PropTypes.array
};

const AreaGraph = ({value}) => {
    return (
        <div className='border rounded' style={{height: '80px', width: '90%'}}>
            <ResponsiveContainer height='100%' width='100%'>
                <AreaChart data={value}>
                    <defs>
                        <linearGradient id='areaColor' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='10%' stopColor={theme.primary} stopOpacity={0.7}/>
                            <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <Area dataKey='y' fill='url(#areaColor)' isAnimationActive={false} stroke={theme.primary} strokeWidth={2} type='linear' />
                </AreaChart>
            </ResponsiveContainer>

        </div>
    );
};

AreaGraph.propTypes = {
    value: PropTypes.array
};

const BarGraph = ({value}) => {

    return (
        <div style={{width: '100px', height: '80px', position: 'relative'}}>
            <div className='custom-grid'><hr/><hr/><hr/><hr/><hr/></div>
            <BarChart data={value.map(({name, value}) => (
                {name, value, fill: getHexColor(name)}
            ))} height={80} width={100}>
                <Bar dataKey='value' maxBarSize={10}/>
            </BarChart>
        </div>
    );
};

BarGraph.propTypes = {
    value: PropTypes.array
};

const Text = ({value}) => {

    return (
        <span>
            {value}
        </span>
    );
};

Text.propTypes = {
    value: PropTypes.string
};

const tableData = [
    {
        accuracy: [{y: 2}, {y: 10}, {y: 5}, {y: 3}, {y: 9}, {y: 25}],
        classes: [{name: 'some name', value: 1234}, {name: 'some name2', value: 2334}, {name: 'some name3', value: 4334}],
        distance: [{y: 2}, {y: 40}, {y: 4}, {y: 3}, {y: 9}, {y: 15}, {y: 6}],
        sample_size: '12900',
        client_id: '4903RY'

    },
    {
        accuracy: [{y: 22}, {y: 43}, {y: 24}, {y: 33}, {y: 56}, {y: 15}, {y: 6}],
        classes: [{name: 'some name4', value: 3434}, {name: 'some name5', value: 2334}, {name: 'some name6', value: 4334}, {name: 'some name7', value: 2334}],
        distance: [{y: 3}, {y: 4}, {y: 5}, {y: 4}, {y: 6}, {y: 1}, {y: 9}, {y: 9}, {y: 6}],
        sample_size: '12900',
        client_id: '4903RY'

    }
];

const Segmentation = () => {
    const [columns, setColumns] = useState(SegmentationFeatures);
    const [addColModal, setAddColModal] = useModal(false);

    const renderComponent = (type, props) => {
        if (type === 'text') {
            return <Text {...props}/>;
        } else if (type === 'area_graph') {
            return <AreaGraph {...props}/>;
        } else if (type === 'bar_graph') {
            return <BarGraph {...props}/>;
        } else {
            return null;
        }
    };

    return (
        <div className='my-5'>
            <h3 className='text-dark fw-bold fs-3 mb-3'>Segmentation</h3>
            <div className='border rounded p-3' >
                <div className='d-flex mb-3'>
                    <p className='text-dark fw-bold fs-5 flex-grow-1'>Fairness &amp; Bias Analysis</p>
                    <Button
                        className='border border-dark text-dark fw-bold px-4'
                        onClick={() => setAddColModal(true)}
                        variant='white'
                    >
                        <FontIcon
                            className='text-dark mx-2'
                            icon={IconNames.PLUS_MINUS}
                            size={15}
                        />
                        Columns
                    </Button>
                </div>
                <Table
                    columns={columns.map((col) => ({
                        Header: col.name,
                        accessor: col.value,
                        Cell: (props) => renderComponent(col.type, props)
                    }))}
                    data={tableData}
                />
            </div>
            {addColModal &&
                <AddColumnModal
                    onApply={(cols) => {
                        setColumns(cols);
                        setAddColModal(false);
                    }}
                    onCancel={() => setAddColModal(false)}
                    selected={columns}
                />
            }
        </div>
    );
};

export default Segmentation;
