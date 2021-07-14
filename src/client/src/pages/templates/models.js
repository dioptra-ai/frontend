import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';
import GeneralSearchBar from './general-search-bar';
import {setupComponent} from '../../helpers/component-helper';
import Pagination from '../../components/pagination';
import Table from 'react-bootstrap/Table';
import FontIcon from '../../components/font-icon';
import {IconNames} from '../../constants';
import {reformatWithAt} from '../../helpers/date-helper';
import {Area, ComposedChart, Line} from 'recharts';
import theme from '../../styles/theme.module.scss';
import {Paths} from '../../configs/route-config';
import {action} from 'mobx';
import Tooltip from 'react-bootstrap/Tooltip';
import Overlay from 'react-bootstrap/Overlay';

const columns = ['Model Name', 'Open Incidents', 'Project', 'Owner', 'Tier', 'Last Deployed', 'Traffic'];
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

const ModelRow = ({model, handleCellClickRedirect}) => {
    const incidentsRef = useRef(null);
    const hasIncidents = model.incidents?.length > 0;
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);

    return (
        <tr className='py-5' key={model._id}>
            <td className='py-2 align-middle'><span className='cursor-pointer' onClick={() => handleCellClickRedirect(model._id, 'MODEL_PERFORMANCE_OVERVIEW')}>{model.name}</span></td>
            <td className='py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center cursor-pointer'
                    onClick={() => handleCellClickRedirect(model._id, 'MODEL_INCIDENTS_AND_ALERTS')}
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
            <td className='py-2 align-middle'>{model.project}</td>
            <td className='py-2 align-middle'>{model.owner}</td>
            <td className='py-2 align-middle'>{model.mlModelTier}</td>
            <td className='py-2 align-middle'>{reformatWithAt(model.lastDeployed)}</td>
            <td className='py-2 align-middle'>
                <div className='d-flex align-items-center justify-content-center'>
                    <ComposedChart data={model.traffic} height={65} width={140}>
                        <defs>
                            <linearGradient id='areaColor' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='5%' stopColor={theme.primary} stopOpacity={0.7}/>
                                <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <Line connectNulls dataKey='y' dot={false} fill={theme.primary} stroke={theme.primary} strokeWidth={1} type='linear'/>
                        <Area dataKey='y' fill='url(#areaColor)' stroke={theme.primary} strokeWidth={1} type='linear' />
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
    model: PropTypes.object,
    tdClasses: PropTypes.string
};

const Models = ({modelStore}) => {
    const history = useHistory();
    const [pageNumber, setPageNumber] = useState(1);

    const totalPages = Math.ceil(modelStore.models.length / NUMBER_OF_RECORDS_PER_PAGE);
    const data = modelStore.models.slice((pageNumber - 1) * NUMBER_OF_RECORDS_PER_PAGE, pageNumber * NUMBER_OF_RECORDS_PER_PAGE);

    const handleCellClickRedirect = useCallback(action((modelId, pathName) => {
        modelStore.activeModelId = modelId;
        history.push(Paths(modelId)[pathName]);
    }));

    useEffect(() => modelStore.fetchModels(), []);

    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput={true} />
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-2 fw-bold'>Models</span>
                    <span><Button className='py-3 px-5 text-white' variant='primary'>REGISTER MODEL</Button></span>
                </div>
                <div className='my-5'>
                    <Table className='models-table'>
                        <thead className='text-secondary border-bottom border-light'>
                            <tr>
                                {columns.map((c, idx) => (
                                    <th className={`text-secondary py-4 ${idx === 0 ? 'w-25' : ''} ${idx === 1 || idx === 6 ? 'text-center' : ''}`} key={c}>{c}</th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((m) => <ModelRow handleCellClickRedirect={handleCellClickRedirect} key={m._id} model={m}/>)}
                        </tbody>
                    </Table>
                </div>
                <Pagination onPageChange={setPageNumber} selectedPage={pageNumber} totalPages={totalPages} />
            </div>
        </>
    );
};

Models.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Models);
