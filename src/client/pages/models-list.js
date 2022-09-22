import React, {useRef, useState} from 'react';
import moment from 'moment';
import {Button, Overlay, OverlayTrigger, Tooltip} from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import {AiOutlineDelete} from 'react-icons/ai';
import PropTypes from 'prop-types';
import {Link, useHistory} from 'react-router-dom';

import TopBar from 'pages/common/top-bar';
import {setupComponent} from 'helpers/component-helper';
import {formatDateTime} from 'helpers/date-helper';
import FontIcon from 'components/font-icon';
import Async from 'components/async';
import {IconNames} from 'constants';
import {Area, AreaChart, Line, ResponsiveContainer, XAxis} from 'recharts';
import theme from 'styles/theme.module.scss';
import ModalComponent from 'components/modal';
import EditModel from 'pages/model/edit-model';
import metricsClient from 'clients/metrics';

const TRAFFIC_START_MOMENT = moment().subtract(1, 'day');
const TRAFFIC_END_MOMENT = moment();

const IncidentsTooltipContent = ({incidents}) => {
    return (
        <div className='bg-warning text-white p-3'>
            {incidents.map((i, idx) => (
                <div className='my-2 text-start d-flex' key={idx}>
                    <div className='me-2'>
                        <FontIcon className={'text-white'} icon={IconNames.WARNING} size={20} />
                    </div>
                    <div>{i}</div>
                </div>
            ))}
        </div>
    );
};

IncidentsTooltipContent.propTypes = {
    incidents: PropTypes.array
};

const _ModelRow = ({model, idx, color, filtersStore, onDeleteModelClick}) => {
    const incidentsRef = useRef(null);
    const hasIncidents = false;
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
    const history = useHistory();

    return (
        <tr className='border-0 border-bottom border-mercury py-5' key={idx}>
            <td className='fs-6 py-2 align-middle'>
                <Link
                    className='cursor-pointer'
                    to='/models/performance'
                    onClick={() => {

                        filtersStore.models = [model];
                    }}
                >
                    {model.name}
                </Link>
            </td>
            <td className='fs-6 py-2 align-middle'>
                <div
                    className='d-flex align-items-center justify-content-center cursor-pointer'
                    onMouseEnter={() => setShouldShowTooltip(hasIncidents && true)}
                    onMouseLeave={() => setShouldShowTooltip(hasIncidents && false)}
                    ref={incidentsRef}
                >
                    {hasIncidents ? (
                        <Link className='text-warning align-middle ms-1' onClick={() => {

                            filtersStore.models = [model];
                            history.push('/models/incidents-and-alerts');
                        }}>
                            {model.incidents.length}
                        </Link>
                    ) : null}
                </div>
                {hasIncidents ? (
                    <Overlay
                        bsPrefix={'warning'}
                        className='bg-warning'
                        show={shouldShowTooltip}
                        target={incidentsRef.current}
                    >
                        {(props) => (
                            <Tooltip id={'modelsTooltip'} {...props}>
                                <IncidentsTooltipContent incidents={model.incidents} />
                            </Tooltip>
                        )}
                    </Overlay>
                ) : null}
            </td>
            <td className='fs-6 py-2 align-middle'>{model.project}</td>
            <td className='fs-6 py-2 align-middle'>{model.owner}</td>
            <td className='fs-6 py-2 align-middle'>{model.mlModelTier}</td>
            <td className='fs-6 py-2 align-middle'>
                {formatDateTime(model.lastDeployed)}
            </td>
            <td className='fs-6 py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center'>
                    <Async
                        fetchData={() => metricsClient('throughput', {
                            sql_filters: `timestamp >= NOW() - INTERVAL '30' DAY AND model_id='${model.mlModelId}' AND dataset_id IS NULL`,
                            granularity_iso: moment.duration(6, 'hour').toISOString()
                        })}
                        renderData={(throughput) => (

                            <ResponsiveContainer height={65} width='100%'>
                                <AreaChart data={throughput.map(({value, time}) => ({
                                    y: value,
                                    x: new Date(time).getTime()
                                }))}>
                                    <defs>
                                        <linearGradient id='areaColor' x1='0' x2='0' y1='0' y2='1'>
                                            <stop offset='5%' stopColor={color} stopOpacity={0.7} />
                                            <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <Line
                                        connectNulls
                                        dataKey='y'
                                        dot={false}
                                        fill={color}
                                        stroke={color}
                                        strokeWidth={1}
                                        type='linear'
                                    />
                                    <XAxis
                                        axisLine={false}
                                        dataKey='x'
                                        domain={[TRAFFIC_START_MOMENT.valueOf(), TRAFFIC_END_MOMENT.valueOf()]}
                                        scale='time'
                                        tick={false}
                                        type='number'
                                    />
                                    <Area
                                        dataKey='y'
                                        fill='url(#areaColor)'
                                        stroke={color}
                                        strokeWidth={1}
                                        type='linear'
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    />
                </div>
            </td>
            <td className='fs-6 py-2 align-middle'>

                <div className='d-flex justify-content-center align-content-center align-items-center'>
                    <OverlayTrigger overlay={
                        <Tooltip>Delete this model</Tooltip>
                    }>
                        <AiOutlineDelete
                            className='fs-3 cursor-pointer'
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteModelClick();
                            }}
                        />
                    </OverlayTrigger>
                </div>
            </td>
        </tr>
    );
};

_ModelRow.propTypes = {
    color: PropTypes.string,
    idx: PropTypes.number,
    model: PropTypes.object,
    filtersStore: PropTypes.object.isRequired,
    onDeleteModelClick: PropTypes.func.isRequired
};

const ModelRow = setupComponent(_ModelRow);

const Models = ({modelStore}) => {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState([]);

    const color = theme.primary;

    const handleSubmit = (data) => {
        if (errors) {
            setErrors([]);
        }

        fetch('/api/ml-model', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((modelData) => {
                if (modelData.error) {

                    throw new Error(modelData.error);
                }
                modelStore.setModelById(modelData._id, modelData);
                setShowModal(false);
            })
            .catch((e) => {

                setErrors([e.message]);
            });
    };

    return (
        <>
            <TopBar hideTimePicker/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Models</span>
                    <span>
                        <Button
                            className='py-3 fs-6 bold-text px-5 text-white'
                            onClick={() => setShowModal(true)}
                            variant='primary'
                        >
            REGISTER MODEL
                        </Button>
                    </span>
                </div>
                <div>
                    <Table className='models-table'>
                        <thead className='align-middle text-secondary'>
                            <tr className='border-0 border-bottom border-mercury'>
                                {[
                                    'Model Name',
                                    'Incidents',
                                    'Project',
                                    'Owner',
                                    'Tier',
                                    'Last Deployed',
                                    '30 Day Throughput',
                                    'Delete'
                                ].map((c, idx) => (
                                    <th
                                        className={`text-secondary border-0 fs-6 py-4 ${
                                            idx === 0 ? 'w-25' : ''
                                        } ${idx === 1 || idx === 6 ? 'text-center' : ''}`}
                                        key={c}
                                    >
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {modelStore.models.map((model) => (
                                <ModelRow color={color} key={model._id} model={model} onDeleteModelClick={() => modelStore.tryDeleteModel(model._id)}/>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            <ModalComponent isOpen={showModal} onClose={() => setShowModal(false)} title='Create New Model'>
                <EditModel
                    errors={errors}
                    initialValue={{}}
                    onSubmit={handleSubmit}
                />
            </ModalComponent>
        </>
    );
};

Models.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Models);
