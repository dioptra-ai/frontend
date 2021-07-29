import React, {useEffect, useRef, useState} from 'react';
import Tooltip from 'react-bootstrap/Tooltip';
import Overlay from 'react-bootstrap/Overlay';
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import GeneralSearchBar from './general-search-bar';
import {setupComponent} from 'helpers/component-helper';
import {formatDateTime} from 'helpers/date-helper';
import Pagination from 'components/pagination';
import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import {Area, ComposedChart, Line} from 'recharts';
import theme from 'styles/theme.module.scss';

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

const ModelRow = ({model, idx, color}) => {
    const incidentsRef = useRef(null);
    const hasIncidents = false;
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);

    return (
        <tr className='border-0 border-bottom border-mercury py-5' key={idx}>
            <td className='fs-6 py-2 align-middle'><Link className='cursor-pointer' to={`/models/${model._id}/performance-overview`}>{model.name}</Link></td>
            <td className='fs-6 py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center cursor-pointer'
                    onMouseEnter={() => setShouldShowTooltip(hasIncidents && true)}
                    onMouseLeave={() => setShouldShowTooltip(hasIncidents && false)}
                    ref={incidentsRef}>
                    <FontIcon className={`text-${hasIncidents ? 'warning' : 'success'}`} icon={hasIncidents ? IconNames.WARNING : IconNames.CHECK} size={25} />
                    {hasIncidents ? <span className='text-decoration-underline text-warning align-middle ms-1'>{model.incidents.length}</span> : null}
                </div>
                {hasIncidents ?
                    <Overlay bsPrefix={'warning'} className='bg-warning' show={shouldShowTooltip} target={incidentsRef.current}>
                        {(props) => <Tooltip id={'modelsTooltip'} {...props}><IncidentsTooltipContent incidents={model.incidents}/></Tooltip>}
                    </Overlay> :
                    null }
            </td>
            <td className='fs-6 py-2 align-middle'>{model.project}</td>
            <td className='fs-6 py-2 align-middle'>{model.owner}</td>
            <td className='fs-6 py-2 align-middle'>{model.mlModelTier}</td>
            <td className='fs-6 py-2 align-middle'>{formatDateTime(model.lastDeployed)}</td>
            <td className='fs-6 py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center'>
                    <ComposedChart data={model.traffic} height={65} width={140}>
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
    idx: PropTypes.number,
    model: PropTypes.object
};

const Models = ({modelStore}) => {
    const [pageNumber, setPageNumber] = useState(0);

    const color = theme.primary;
    const totalPages = Math.ceil(modelStore.models.length / NUMBER_OF_RECORDS_PER_PAGE);
    const data = modelStore.models.slice(pageNumber * NUMBER_OF_RECORDS_PER_PAGE, (pageNumber + 1) * NUMBER_OF_RECORDS_PER_PAGE);

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
                            <span className='h2 fs-1 text-dark fw-bold'>Models</span>
                            <span><Button className='py-3 fs-6 fw-bold px-5 text-white' variant='primary'>REGISTER MODEL</Button></span>
                        </div>
                        <div className='mt-5'>
                            <Table className='models-table'>
                                <thead className='align-middle text-secondary'>
                                    <tr className='border-0 border-bottom border-mercury'>
                                        {['Model Name', 'Open Incidents', 'Project', 'Owner', 'Tier', 'Last Deployed', 'Traffic'].map((c, idx) => (
                                            <th className={`text-secondary border-0 fs-6 py-4 ${idx === 0 ? 'w-25' : ''} ${idx === 1 || idx === 6 ? 'text-center' : ''}`} key={c}>{c}</th>))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((model) => <ModelRow color={color} key={model._id} model={model}/>)}
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
