import React, {useEffect, useRef, useState} from 'react';
import {action} from 'mobx';
import Tooltip from 'react-bootstrap/Tooltip';
import Overlay from 'react-bootstrap/Overlay';
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';

import GeneralSearchBar from './general-search-bar';
import {setupComponent} from 'helpers/component-helper';
import Pagination from 'components/pagination';
import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import {Area, ComposedChart, Line} from 'recharts';
import theme from 'styles/theme.module.scss';
import {Paths} from 'configs/route-config';

const NUMBER_OF_RECORDS_PER_PAGE = 10;

const IncidentsTooltipContent = ({incidents}) => {
    return (
        <div className='bg-warning text-white p-3'>
            {incidents.map((i, idx) => <div className='my-2 text-start d-flex' key={idx}>
                <div className='me-2'><FontIcon className={'text-white'} icon={IconNames.WARNING} size={20}/></div>
                <div>{i}</div>
            </div>)}
        </div>
    );
};

IncidentsTooltipContent.propTypes = {
    incidents: PropTypes.array
};

const ModelRow = ({m, idx, handleCellClickRedirect, color}) => {
    const incidentsRef = useRef(null);
    const hasIncidents = false;
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);

    return (
        <tr className='py-5' key={idx}>
            <td className='py-2 align-middle'><span className='cursor-pointer' onClick={() => handleCellClickRedirect(m.id, 'MODEL_PERFORMANCE_OVERVIEW')}>{m.name}</span></td>
            <td className='py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center cursor-pointer'
                    onClick={() => handleCellClickRedirect(m.id, 'MODEL_INCIDENTS_AND_ALERTS')}
                    onMouseEnter={() => setShouldShowTooltip(hasIncidents && true)}
                    onMouseLeave={() => setShouldShowTooltip(hasIncidents && false)}
                    ref={incidentsRef}>
                    <FontIcon className={`text-${hasIncidents ? 'warning' : 'success'}`} icon={hasIncidents ? IconNames.WARNING : IconNames.CHECK} size={25} />
                    {hasIncidents ? <span className='text-decoration-underline text-warning align-middle ms-1'>{m.incidents.length}</span> : null}
                </div>
                {hasIncidents ?
                    <Overlay bsPrefix={'warning'} className='bg-warning' show={shouldShowTooltip} target={incidentsRef.current}>
                        {(props) => <Tooltip id={'modelsTooltip'} {...props}><IncidentsTooltipContent incidents={m.incidents}/></Tooltip>}
                    </Overlay> :
                    null }
            </td>
            <td className='py-2 align-middle'>{m.project}</td>
            <td className='py-2 align-middle'>{m.owner}</td>
            <td className='py-2 align-middle'>{m.tier}</td>
            <td className='py-2 align-middle'>{m.deployed}</td>
            <td className='py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center'>
                    <ComposedChart data={m.traffic} height={65} width={140}>
                        <defs>
                            <linearGradient id='areaColor' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='5%' stopColor={color} stopOpacity={0.7}/>
                                <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <Line connectNulls dataKey='y' dot={false} fill={color} stroke={color} strokeWidth={1} type='linear'/>
                        <Area dataKey='y' fill='url(#areaColor)' stroke={color} strokeWidth={1} type='linear' />
                    </ComposedChart>
                </div>
            </td>
        </tr>
    );
};

ModelRow.propTypes = {
    color: PropTypes.string,
    handleCellClickRedirect: PropTypes.func,
    idx: PropTypes.number,
    m: PropTypes.object
};

const Models = ({modelStore}) => {
    const history = useHistory();
    const [pageNumber, setPageNumber] = useState(0);

    const color = theme.primary;
    const totalPages = Math.ceil(modelStore.models.length / NUMBER_OF_RECORDS_PER_PAGE);
    const data = modelStore.models.slice(pageNumber * NUMBER_OF_RECORDS_PER_PAGE, (pageNumber + 1) * NUMBER_OF_RECORDS_PER_PAGE);

    const handleCellClickRedirect = action((modelId, pathName) => {
        modelStore.activeModelId = modelId;
        history.push(Paths(modelId)[pathName]);
    });

    useEffect(() => {
        modelStore.fetchModels();
    }, []);

    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput={true} />
            {

                modelStore.state === modelStore.STATE_PENDING ? 'Loading...' : (
                    <div className='p-4 mt-5'>
                        <div className='d-flex justify-content-between'>
                            <span className='h2 fs-2 fw-bold'>Models</span>
                            <span><Button className='py-3 px-5 text-white' variant='primary'>REGISTER MODEL</Button></span>
                        </div>
                        <div className='my-5'>
                            <Table className='models-table'>
                                <thead className='text-secondary border-bottom border-light'>
                                    <tr>
                                        {['Model Name', 'Open Incidents', 'Project', 'Owner', 'Tier', 'Last Deployed', 'Traffic'].map((c, idx) => (
                                            <th className={`text-secondary py-4 ${idx === 0 ? 'w-25' : ''} ${idx === 1 || idx === 6 ? 'text-center' : ''}`} key={c}>{c}</th>))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((m, idx) => <ModelRow color={color} handleCellClickRedirect={handleCellClickRedirect} idx={idx} key={idx} m={m}/>)}
                                </tbody>
                            </Table>
                        </div>
                        <Pagination onPageChange={setPageNumber} totalPages={totalPages} />
                    </div>
                )
            }
        </>
    );
};

Models.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Models);
