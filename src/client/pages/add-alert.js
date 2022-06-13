/* eslint-disable */
import Form from 'react-bootstrap/Form';
import baseJSONClient from 'clients/base-json-client';
import FontIcon from 'components/font-icon';
import Select from 'components/select';
import TextArea from 'components/text-area';
import { IconNames } from 'constants';
import useModel from 'hooks/use-model';
import { AlertTypes } from 'enums/alert-types';
import { AlertErrorHandlingStatuses } from 'enums/alert-error-handling-states';
import { Comparators } from 'enums/comparators';
import { LogicalOperators } from 'enums/logical-operators';
import { NotificationTypes } from 'enums/notification-types';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import BtnIcon from '../components/btn-icon';
import DynamicArray from '../components/generic/dynamic-array';
import {noop} from '../constants';
import {setupComponent} from '../helpers/component-helper';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import { IsoDurations } from '../enums/iso-durations';
import { getMetricsForModel } from '../enums/metrics';

const inputStyling = 'form-control bg-white-blue';
const BinButton = ({onClick = noop, className}) => (
    <button
        className={`border border-1 border-mercury h-100 d-flex align-items-center p-3 bg-white rounded-3 ${className}`}
        onClick={onClick}
    >
        <FontIcon
            className={`text-secondary ${className}`}
            icon={IconNames.BIN}
            size={20}
        />
    </button>
);

BinButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

const AddButton = ({onClick = noop}) => (
    <Button className='text-white w-100 py-2' onClick={onClick} variant={'primary'}>
        <FontIcon className='me-2' icon={IconNames.PLUS} size={10} />
        <span>ADD</span>
    </Button>
);

AddButton.propTypes = {
    onClick: PropTypes.func
};
const LabelBox = ({
    text,
    isUnderlined = false,
    color = 'primary',
    isBold = true
}) => (
    <div
        className={`text-${color} fs-6 fw-${
            isBold ? 'bold' : 'normal'
        } rounded-3 p-3 border border-1 border-light ${
            isUnderlined ? 'text-decoration-underline' : ''
        }`}
        style={{wordBreak: 'break-all'}}
    >
        {text}
    </div>
);

LabelBox.propTypes = {
    color: PropTypes.string,
    isBold: PropTypes.bool,
    isUnderlined: PropTypes.bool,
    text: PropTypes.string
};

const FormSection = ({name = '', children}) => (
    <Row className='py-4'>
        <Col xl={12}>
            <h6 className='mb-0 text-dark bold-text'>{name}</h6>
        </Col>
        {children}
    </Row>
);

FormSection.propTypes = {
    children: PropTypes.any.isRequired,
    name: PropTypes.string
};

const ErrorHandlingRow = ({errorCondition, initialValue, onChange}) => {
    return (
        <Row>
            <Col xl={3}>
                <LabelBox color='dark' isBold={false} text={errorCondition} />
            </Col>
            <Col xl={2}>
                <LabelBox text='SET STATE TO' />
            </Col>
            <Col xl={2}>
                <Select
                    initialValue={initialValue}
                    onChange={onChange}
                    options={Object.values(AlertErrorHandlingStatuses)}
                />
            </Col>
        </Row>
    );
};

ErrorHandlingRow.propTypes = {
    errorCondition: PropTypes.string,
    initialValue: PropTypes.string,
    onChange: PropTypes.func
};

const ConditionRow = ({
    handleRowDataChange,
    handleDeleteRow,
    handleAddRow,
    isFirst,
    isLast,
    idx,
    rowState
}) => {
    const handleLogicalChange = (newValue) =>
        handleRowDataChange({logicalOperator: newValue});
    const handleMetricChange = (newValue) => handleRowDataChange({metric: newValue});
    const handleComparatorChange = (newValue) => {
        if (newValue === Comparators.HAS_NO_VALUE.value) {
            handleRowDataChange({valueToCompare: ''}); 
        }
        handleRowDataChange({comparator: newValue})
    };
    const handleValueToCompareChange = (newValue) =>
        handleRowDataChange({
            valueToCompare: newValue.replace(',', '.')
        });
    const model = useModel();

    return (
        <span key={idx}>
            <Row className='mt-3 align-items-center g-1'>
                <Col xl={1}>
                    {isFirst ? 'WHEN' : (
                        <Select
                            initialValue={rowState.logicalOperator}
                            isTextBold
                            onChange={handleLogicalChange}
                            options={Object.values(LogicalOperators)}
                            textColor='primary'
                        />
                    )}
                </Col>
                <Col className='d-flex' xl={2}>
                    <Select
                        initialValue={rowState.metric}
                        selectValue={rowState.metric}
                        onChange={handleMetricChange}
                        options={Object.values(
                            getMetricsForModel(model.mlModelType)
                        )}
                    />
                </Col>
                <Col xl={2}>
                    <Select
                        initialValue={rowState.comparator}
                        isTextBold
                        onChange={handleComparatorChange}
                        options={Object.values(Comparators)}
                        textColor='primary'
                    />
                </Col>
                <Col className='d-flex' xl={2}>
                    {rowState.comparator !== 'HAS_NO_VALUE' && (
                        <Form.Control
                            type='number'
                            className='form-control bg-white-blue'
                            initialValue={rowState.valueToCompare}
                            onChange={(e) => handleValueToCompareChange(e.target.value)}
                        />
                    )}
                    {isFirst ? null : (
                        <div className='ms-3'>
                            <BinButton onClick={handleDeleteRow} />
                        </div>
                    )}
                </Col>
            </Row>
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

const RecipientRow = ({
    handleRowDataChange,
    handleDeleteRow,
    handleAddRow,
    isFirst,
    rowState
}) => {
    const handleTypeChange = (newType) => handleRowDataChange({type: newType});
    const handleAddressChange = (newAddress) =>
        handleRowDataChange({address: newAddress});

    return (
        <>
            <Form.Label column>{isFirst ? 'POST' : null}</Form.Label>
            <Col xl={11}>
                <Form.Control
                    className={inputStyling}
                    initialValue={rowState.address}
                    onChange={handleAddressChange}
                    placeholder='Enter webhook URL (ex. Slack webhook URL)'
                />
            </Col>
        </>
    );
};

RecipientRow.propTypes = {
    handleAddRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleRowDataChange: PropTypes.func,
    isFirst: PropTypes.bool,
    rowState: PropTypes.object
};

const TagRow = ({
    handleRowDataChange,
    handleDeleteRow,
    handleAddRow,
    isFirst,
    isLast,
    idx,
    rowState,
    hasData
}) => {
    const handleNameChange = (newName) => handleRowDataChange({name: newName});
    const handleValueChange = (newValue) => handleRowDataChange({value: newValue});

    if (!hasData) {
        return (
            <>
                <Row className='my-3'>
                    <Col xl={1}>
                        <LabelBox text='TAGS' />
                    </Col>
                </Row>
                <Row className='my-3'>
                    <AddButton onClick={handleAddRow} />
                </Row>
            </>
        );
    }

    return (
        <span key={idx}>
            <Row className='my-3'>
                <Col xl={1}>{isFirst ? <LabelBox text='TAGS' /> : null}</Col>
                <Col xl={5}>
                    <Form.Control
                        className={inputStyling}
                        initialValue={rowState.name}
                        onChange={handleNameChange}
                        placeholder='Enter tag name'
                    />{' '}
                </Col>
                <Col className='d-flex' xl={6}>
                    <div className='flex-grow-1'>
                        <Form.Control
                            className={inputStyling}
                            initialValue={rowState.value}
                            onChange={handleValueChange}
                            placeholder='Enter tag value'
                        />{' '}
                    </div>
                    <div className='ms-3'>
                        <BinButton onClick={handleDeleteRow} />
                    </div>
                </Col>
            </Row>
            {isLast ? (
                <Row className='my-3'>
                    <Col xl={1}>
                        <AddButton onClick={handleAddRow} />
                    </Col>
                </Row>
            ) : null}
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

const AddAlertPage = (props) => {
    const model = useModel();
    const alertSqlFilters = useAllSqlFilters({excludeCurrentTimeFilters: true});

    const conditionInitialValue = {
        logicalOperator: LogicalOperators.AND.value,
        metric: Object.values(getMetricsForModel(model.mlModelType))[0].value,
        comparator: Comparators.IS_ABOVE_OR_EQUAL.value
    };
    const recipientInitialValue = {type: NotificationTypes.SLACK.value, address: ''};
    const history = useHistory();
    const [recipients, setRecipients] = useState([recipientInitialValue]);
    const [template, setTemplate] = useState();
    const [alertName, setAlertName] = useState('');
    const [conditions, setConditions] = useState([conditionInitialValue]);
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [evaluationPeriod, setEvaluationPeriod] = useState(IsoDurations.PT5M.value);
    const [alertId, setAlertId] = useState('');
    const [alertType, setAlertType] = useState(AlertTypes.THRESHOLD.value);
    const [addAlertInProgress, setAddAlertInProgress] = useState(false);

    // TODO: create button isn't enabled because evaluationPeriod isnt set AND conditions[0] has no valueToCompare

    const goToPreviousRoute = useCallback(() => {
        history.goBack();
    }, []);

    const handleCreate = (update) => {
        setAddAlertInProgress(true);
        baseJSONClient(update ? `/api/tasks/alert?id=${alertId}` : '/api/tasks/alert', {
            method: update ? 'PUT' : 'POST',
            body: {
                name: alertName,
                type: alertType,
                evaluation_period: evaluationPeriod,
                conditions,
                modelType: model.mlModelType,
                sqlFilters: alertSqlFilters,
                notification: notificationEnabled ? {
                    recipients: recipients,
                    template: JSON.parse(template ? template : '{ "text" : "$dioptra_message" }')
                } : {}
            }
        }).then(() => {
            goToPreviousRoute();
        }).catch(console.error)
        .finally(() => {
            setAddAlertInProgress(false);
        });
    };

    React.useEffect(() => {
        if (props.match.params.id) {
            baseJSONClient(`/api/tasks/alert?id=${props.match.params.id}`)
                .then(response => {
                    const alert = response.alert;
                    setAlertId(alert._id)
                    setAlertName(alert.name)
                    setConditions(alert.conditions)
                    setEvaluationPeriod(alert.evaluation_period)
                    if (alert.notification_channel_id) {
                        baseJSONClient(`/api/tasks/notification/channel?id=${alert.notification_channel_id}`)
                            .then(response => {
                                const channel = response.notification_channel
                                setTemplate(channel.template)
                                setRecipients(channel.recipients)
                            })
                    } else {
                        setNotificationEnabled(false)
                    }
                })
        }
    }, [props.match.params.id])

    return (
        <Container className='py-5 px-4' fluid>
            <Row>
                <Col className='d-flex align-items center' lg={12}>
                    <h3 className='text-dark bold-text flex-grow-1'>{!props.match.params.id ? "Add Alert" : "Edit Alert"}</h3>
                    <BtnIcon
                        className='text-dark border-0'
                        icon={IconNames.CLOSE}
                        onClick={goToPreviousRoute}
                        size={20}
                    />
                </Col>
            </Row>
            <Row className='py-5  justify-content-between'>
                <Col className='d-flex align-items-center' xl={8}>
                    <div>
                        {
                            <h6 className='mb-0 text-dark bold-text'>
                                {'Alert name'}
                            </h6>
                        }
                    </div>
                    <div className='flex-grow-1 ms-3'>
                        <Form.Control
                            className={inputStyling}
                            value={alertName}
                            onChange={(e) => setAlertName(e.target.value)}
                            placeholder='Enter Alert Name'
                        />{' '}
                    </div>
                </Col>
                <Col className='d-flex align-items-center' xl={4}>
                    <div>
                        {
                            <h6 className='mb-0 text-dark bold-text'>
                                {'Evaluate every'}
                            </h6>
                        }
                    </div>
                    <div className='flex-grow-1 ms-3'>
                        <Select
                            value={evaluationPeriod}
                            onChange={setEvaluationPeriod}
                            options={Object.values(IsoDurations)}
                            textColor='primary'
                        />
                    </div>
                </Col>
            </Row>
            <div className='border-bottom border-bottom-2'></div>
            <FormSection name='Conditions'>
                <Col className='mt-2' xl={12}>
                    <DynamicArray
                        data={conditions}
                        newRowInitialState={conditionInitialValue}
                        onChange={setConditions}
                        renderRow={ConditionRow}
                    />
                </Col>
            </FormSection>
            <label className='checkbox fs-6' style={{marginBottom: notificationEnabled ? 0 : 20, width: 180}}>
                <input
                    defaultChecked={notificationEnabled}
                    onChange={(e) => setNotificationEnabled(e.target.checked)}
                    type='checkbox'
                />
                <span className='fs-6'>Enable notifications</span>
            </label>
            { notificationEnabled && <div>
                <FormSection name='Notifications'>
                    <Form.Group as={Row}>
                        <DynamicArray data={recipients} newRowInitialState={recipientInitialValue} onChange={setRecipients} renderRow={RecipientRow} />
                    </Form.Group>
                    <Form.Group as={Row}>
                            <Form.Label column xl={1}>BODY</Form.Label>
                            <Col xl={11}><TextArea className={inputStyling} inputValue={template} onChange={setTemplate} placeholder='Enter webhook body or leave it empty to use default: { "text" : "$dioptra_message" }' rows={9} />
                                <Form.Text muted>
                                    Use <strong>$dioptra_message</strong> key in webhook template to use original Dioptra alert message
                                </Form.Text>
                            </Col>
                        </Form.Group>
                </FormSection>
            </div> }
            <div className='border-bottom border-bottom-2'></div>
            <Row className='pt-4'>
                <Col xl={2}>
                    <Button
                        disabled={
                            !alertName ||
                            !alertType ||
                            !evaluationPeriod ||
                            !conditions ||
                            addAlertInProgress ||
                            conditions.filter((condition) => {
                                return (
                                    (!condition.valueToCompare ||
                                    condition.valueToCompare === '')
                                    && condition.comparator !== Comparators.HAS_NO_VALUE.value
                                );
                            }).length !== 0 ||
                            (notificationEnabled && recipients.filter((recipient) => recipient.address === '').length !== 0)
                        }
                        className='w-100 p-3 text-white'
                        onClick={() => { handleCreate(props.match.params.id !== undefined) }}
                        variant='primary'
                    >
                        {!props.match.params.id ? "CREATE" : "UPDATE"}
                    </Button>
                </Col>
                <Col xl={2}>
                    <Button
                        className='w-100 p-3 text-secondary'
                        onClick={goToPreviousRoute}
                        variant='light'
                    >
                        CANCEL
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

AddAlertPage.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(AddAlertPage);
