import React, {useCallback, useState} from 'react';
import {useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Button, Col, Container, Row} from 'react-bootstrap';
import {AlertTypes} from 'enums/alert-types';
import RadioButtons from 'components/radio-buttons';
import Select from 'components/select';
import {LogicalOperators} from 'enums/logical-operators';
import {AlertConditions} from 'enums/alert-conditions';
import {Comparators} from 'enums/comparators';
import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import {AlertErrorHandlingStatuses} from 'enums/alert-error-handling-states';
import {AlertAutoResolvePeriods} from 'enums/alert-auto-resolve-periods';
import {NotificationTypes} from 'enums/notification-types';
import TextArea from 'components/text-area';
import TextInput from 'components/text-input';
import {setupComponent} from '../helpers/component-helper';
import {noop} from '../constants';
import DynamicArray from '../components/generic/dynamic-array';

const inputStyling = 'form-control py-3 bg-light mt-0';
const BinButton = ({onClick = noop, className}) => (
    <button className={`border border-1 border-light h-100 d-flex align-items-center p-3 bg-white rounded-3 ${className}`} onClick={onClick}>
        <FontIcon className={`text-secondary ${className}`} icon={IconNames.BIN} size={20} />
    </button>
);

BinButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

const AddButton = ({onClick = noop}) => (
    <Col className='d-flex' xl={1}>
        <Button className='text-white w-100 p-2' onClick={onClick} variant={'primary'}>
            <FontIcon className='me-2' icon={IconNames.PLUS} size={15}/>
            <span>ADD</span>
        </Button>
    </Col>
);

AddButton.propTypes = {
    onClick: PropTypes.func
};

const LabelBox = ({text, isUnderlined = false, color = 'primary'}) => (
    <div className={`text-${color} rounded-3 p-3 border border-1 border-light ${isUnderlined ? 'text-decoration-underline' : ''}`}> {text} </div>
);

LabelBox.propTypes = {
    color: PropTypes.string,
    isUnderlined: PropTypes.bool,
    text: PropTypes.string
};

const FormSection = ({name = '', children, shouldShowBottomBorder = false}) => (
    <Row className={`py-4 ${shouldShowBottomBorder ? 'border-bottom' : ''}`}>
        <Col xl={12}><h5 className='mb-0'>{name}</h5></Col>
        {children}
    </Row>
);

FormSection.propTypes = {
    children: PropTypes.any.isRequired,
    name: PropTypes.string,
    shouldShowBottomBorder: PropTypes.bool
};

const ErrorHandlingRow = ({errorCondition, initialValue, onChange}) => {
    return (
        <Row>
            <Col xl={4}><LabelBox color='dark' text={errorCondition}/></Col>
            <Col xl={3}><LabelBox text='SET STATE TO'/></Col>
            <Col xl={2}><Select backgroundColor='light' initialValue={initialValue} onChange={onChange} options={Object.values(AlertErrorHandlingStatuses)} /></Col>
        </Row>
    );
};

ErrorHandlingRow.propTypes = {
    errorCondition: PropTypes.string,
    initialValue: PropTypes.string,
    onChange: PropTypes.func
};

const ConditionRow = ({handleRowDataChange, handleDeleteRow, handleAddRow, isFirst, isLast, idx, rowState}) => {
    const handleLogicalChange = (newValue) => handleRowDataChange({logicalOperator: newValue});
    const handleConditionChange = (newValue) => handleRowDataChange({name: newValue});
    const handleMetricChange = (newValue) => handleRowDataChange({metric: newValue});
    const handleComparatorChange = (newValue) => handleRowDataChange({comparator: newValue});
    const handleValueToCompareChange = (newValue) => handleRowDataChange({valueToCompare: newValue});

    return (
        <span key={idx}>
            <Row className='mt-3'>
                <Col xl={1}>
                    {isFirst ?
                        <LabelBox text='WHEN'/> :
                        <Select backgroundColor='white' initialValue={rowState.logicalOperator} onChange={handleLogicalChange} options={Object.values(LogicalOperators)} textColor='primary'/>
                    }
                </Col>
                <Col xl={3}><Select backgroundColor='light' initialValue={rowState.name} onChange={handleConditionChange} options={Object.values(AlertConditions)}/></Col>
                <Col xl={1}><LabelBox text='OF'/></Col>
                <Col xl={1}><LabelBox isUnderlined={true} text='METRIC'/></Col>
                <Col xl={3}><TextInput className='form-control py-3 mt-0 bg-light' initialValue={rowState.metric} onChange={handleMetricChange}/></Col>
                <Col xl={2}><Select backgroundColor='white' initialValue={rowState.comparator} onChange={handleComparatorChange} options={Object.values(Comparators)} textColor='primary'/></Col>
                <Col xl={1}>
                    <Row>
                        <Col xl={9}> <TextInput className='form-control py-3 mt-0 bg-light' initialValue={rowState.valueToCompare} onChange={handleValueToCompareChange}/> </Col>
                        <Col xl={3}> {isFirst ? null : <BinButton onClick={handleDeleteRow}/> } </Col>
                    </Row>
                </Col>
            </Row>
            {isLast ? <Row className='my-3'><AddButton onClick={handleAddRow}/></Row> : null}
        </span>
    );
};

ConditionRow.propTypes = {
    handleAddRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleRowDataChange: PropTypes.func,
    idx: PropTypes.number,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
    rowState: PropTypes.object
};

const RecipientRow = ({handleRowDataChange, handleDeleteRow, handleAddRow, isFirst, idx, rowState}) => {
    const handleTypeChange = (newType) => handleRowDataChange({type: newType});
    const handleAddressChange = (newAddress) => handleRowDataChange({address: newAddress});

    return (
        <Row className='my-3' key={idx}>
            <Col xl={1}>{isFirst ? <LabelBox text='SEND TO'/> : null}</Col>
            <Col xl={2}><Select backgroundColor='light' initialValue={rowState.type} onChange={handleTypeChange} options={Object.values(NotificationTypes)} /></Col>
            <Col xl={8}><TextInput className={inputStyling} initialValue={rowState.address} onChange={handleAddressChange} placeholder='Enter email'/> </Col>
            { isFirst ? <AddButton onClick={handleAddRow}/> : <Col xl={1}><BinButton onClick={handleDeleteRow}/></Col> }
        </Row>
    );
};

RecipientRow.propTypes = {
    handleAddRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleRowDataChange: PropTypes.func,
    idx: PropTypes.number,
    isFirst: PropTypes.bool,
    rowState: PropTypes.object
};

const TagRow = ({handleRowDataChange, handleDeleteRow, handleAddRow, isFirst, isLast, idx, rowState, hasData}) => {
    const handleNameChange = (newName) => handleRowDataChange({name: newName});
    const handleValueChange = (newValue) => handleRowDataChange({value: newValue});

    if (!hasData) {
        return (
            <>
                <Row className='my-3'><Col xl={1}><LabelBox text='TAGS'/></Col></Row>
                <Row className='my-3'><AddButton onClick={handleAddRow}/></Row>
            </>
        );
    }

    return (
        <span key={idx}>
            <Row className='my-3'>
                <Col xl={1}>{isFirst ? <LabelBox text='TAGS'/> : null}</Col>
                <Col xl={5}><TextInput className={inputStyling} initialValue={rowState.name} onChange={handleNameChange} placeholder='Enter tag name' /> </Col>
                <Col className='d-flex' xl={6}>
                    <div className='flex-grow-1'><TextInput className={inputStyling} initialValue={rowState.value} onChange={handleValueChange} placeholder='Enter tag value' /> </div>
                    <div className='ms-3'><BinButton onClick={handleDeleteRow}/></div>
                </Col>
            </Row>
            {isLast ? <Row className='my-3'><AddButton onClick={handleAddRow}/></Row> : null}
        </span>
    );
};

TagRow.propTypes = {
    handleAddRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleRowDataChange: PropTypes.func,
    hasData: PropTypes.bool,
    idx: PropTypes.number,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
    rowState: PropTypes.object
};

const AddAlertPage = () => {
    const conditionInitialValue = {
        logicalOperator: LogicalOperators.AND.value,
        name: AlertConditions.PERCENT_DIFF_ABS.value,
        comparator: Comparators.IS_ABOVE_OR_EQUAL.value
    };
    const recipientInitialValue = {type: NotificationTypes.EMAIL.value};
    const history = useHistory();
    const [tags, setTags] = useState([{}]);
    const [recipients, setRecipients] = useState([recipientInitialValue]);
    const [message, setMessage] = useState('');
    const [alertName, setAlertName] = useState('');
    const [conditions, setConditions] = useState([conditionInitialValue, conditionInitialValue]);
    const [evaluationPeriod, setEvaluationPeriod] = useState('');
    const [conditionsPeriod, setConditionsPeriod] = useState('');
    const [alertType, setAlertType] = useState(AlertTypes.THRESHOLD.value);
    const [autoResolve, setAutoResolvePeriod] = useState(AlertAutoResolvePeriods.NEVER.value);
    const [stateForNoDateOrNullValues, setStateForNoDateOrNullValues] = useState(AlertErrorHandlingStatuses.ALERTING.value);
    const [stateExecutionErrorOrTimeout, setStateExecutionErrorOrTimeout] = useState(AlertErrorHandlingStatuses.ALERTING.value);

    const goToPreviousRoute = useCallback(() => {
        history.goBack();
    }, []);
    const handleCreate = useCallback(() => {
        const newAlert = {alertName, alertType, evaluationPeriod, conditions, conditionsPeriod, autoResolve,
            noDateAndErrorHandling: {stateForNoDateOrNullValues, stateExecutionErrorOrTimeout},
            notifications: {message, recipients, tags}
        };

        console.log(newAlert);
        goToPreviousRoute();
    }, [alertName, alertType, evaluationPeriod, conditionsPeriod, autoResolve, stateExecutionErrorOrTimeout, stateForNoDateOrNullValues, conditions, message, recipients, tags]);

    return (
        <Container className='p-5' fluid>
            <Row>
                <Col lg={12}>
                    <h2>Add Alert</h2>
                </Col>
            </Row>
            <Row className='py-5 border-bottom border-bottom-2'>
                <Col className='d-flex align-items-center' xl={7}>
                    <div>{<h5 className='mb-0'>{'Alert name'}</h5>}</div>
                    <div className='flex-grow-1 ms-3'><TextInput className={inputStyling} onChange={setAlertName} placeholder='Enter Alert Name'/> </div>
                </Col>
                <Col className='d-flex align-items-center' xl={5}>
                    <div>{<h5 className='mb-0'>{'Evaluate every'}</h5>}</div>
                    <div className='flex-grow-1 ms-3'><TextInput className={inputStyling} onChange={setEvaluationPeriod} placeholder='Enter Time (example: 30sec or 5min)' /> </div>
                </Col>
            </Row>
            <FormSection name='Alert Type'>
                <Col className='mt-4' xl={12}><RadioButtons initialValue={alertType} items={Object.values(AlertTypes)} onChange={setAlertType}/></Col>
            </FormSection>
            <FormSection name='Conditions'>
                <Col className='mt-2' xl={12}>
                    <DynamicArray data={conditions} newRowInitialState={conditionInitialValue} onChange={setConditions} renderRow={ConditionRow}/>
                    <Row className='mt-4'>
                        <Col xl={3}><LabelBox text='DURING THE LAST'/></Col>
                        <Col xl={1}><TextInput className={inputStyling} onChange={setConditionsPeriod}/></Col>
                    </Row>
                </Col>
            </FormSection>
            <FormSection name='No Date & Error Handling'>
                <Col className='mt-4' xl={9}>
                    <ErrorHandlingRow errorCondition='If no date or all values are null' initialValue={stateForNoDateOrNullValues} onChange={setStateForNoDateOrNullValues}/>
                </Col>
                <Col className='mt-4' xl={9}>
                    <ErrorHandlingRow errorCondition='If execution error or timeout' initialValue={stateExecutionErrorOrTimeout} onChange={setStateExecutionErrorOrTimeout}/>
                </Col>
            </FormSection>
            <FormSection name='Autoresolve'>
                <Col className='mt-2' xl={3}>
                    <Select backgroundColor='light' initialValue={autoResolve} onChange={setAutoResolvePeriod} options={Object.values(AlertAutoResolvePeriods)}/>
                </Col>
            </FormSection>
            <FormSection name='Notifications' shouldShowBottomBorder={true}>
                <Col className='mt-2' xl={12}>
                    <DynamicArray data={recipients} newRowInitialState={recipientInitialValue} onChange={setRecipients} renderRow={RecipientRow} />
                    <Row className='my-3'>
                        <Col xl={1}><LabelBox text='MESSAGE'/></Col>
                        <Col xl={11}><TextArea className={inputStyling} onChange={setMessage} placeholder='Notification message details' rows={9} /></Col>
                    </Row>
                    <DynamicArray data={tags} onChange={setTags} renderRow={TagRow} />
                </Col>
            </FormSection>
            <Row className='pt-4'>
                <Col xl={2}><Button className='w-100 p-3 text-white' onClick={handleCreate} variant='primary'>CREATE</Button></Col>
                <Col xl={2}><Button className='w-100 p-3 text-secondary' onClick={goToPreviousRoute} variant='light'>CANCEL</Button></Col>
            </Row>
        </Container>
    );
};

export default setupComponent(AddAlertPage, 'AddAlertPage');
