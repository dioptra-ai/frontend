/* eslint-disable */
import baseJSONClient from 'clients/base-json-client';
import FontIcon from 'components/font-icon';
import Select from 'components/select';
import TextInput from 'components/text-input';
import { IconNames } from 'constants';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import { AlertAutoResolvePeriods } from 'enums/alert-auto-resolve-periods';
import { AlertErrorHandlingStatuses } from 'enums/alert-error-handling-states';
import { AlertTypes } from 'enums/alert-types';
import { Comparators } from 'enums/comparators';
import { LogicalOperators } from 'enums/logical-operators';
import { NotificationTypes } from 'enums/notification-types';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import BtnIcon from '../components/btn-icon';
import DynamicArray from '../components/generic/dynamic-array';
import { noop } from '../constants';
import { IsoDurations } from '../enums/iso-durations';
import { getMetricsForModel } from '../enums/metrics';
import { setupComponent } from '../helpers/component-helper';

const inputStyling = 'form-control py-3 bg-white-blue mt-0';
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
    <Button className="text-white w-100 py-2" onClick={onClick} variant={'primary'}>
        <FontIcon className="me-2" icon={IconNames.PLUS} size={10} />
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
    <Row className="py-4">
        <Col xl={12}>
            <h6 className="mb-0 text-dark bold-text">{name}</h6>
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
                <LabelBox color="dark" isBold={false} text={errorCondition} />
            </Col>
            <Col xl={2}>
                <LabelBox text="SET STATE TO" />
            </Col>
            <Col xl={2}>
                <Select
                    backgroundColor="white-blue"
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
    const handleComparatorChange = (newValue) =>
        handleRowDataChange({comparator: newValue});
    const handleValueToCompareChange = (newValue) =>
        handleRowDataChange({
            valueToCompare: newValue.replace(',', '.')
        });
    const model = useModel();

    return (
        <span key={idx}>
            <Row className="mt-3 align-items-center">
                <Col xl={1}>
                    {isFirst ? (
                        <LabelBox text="WHEN" />
                    ) : (
                        <Select
                            backgroundColor="white"
                            initialValue={rowState.logicalOperator}
                            isTextBold
                            onChange={handleLogicalChange}
                            options={Object.values(LogicalOperators)}
                            textColor="primary"
                        />
                    )}
                </Col>
                <Col className="d-flex" xl={2}>
                    <Select
                        initialValue={rowState.metric}
                        onChange={handleMetricChange}
                        options={Object.values(
                            getMetricsForModel(model.mlModelType)
                        )}
                    />
                </Col>
                <Col xl={rowState.comparator === 'HAS_NO_VALUE' ? 2 : 1}>
                    <Select
                        backgroundColor="white"
                        initialValue={rowState.comparator}
                        isTextBold
                        onChange={handleComparatorChange}
                        options={Object.values(Comparators)}
                        textColor="primary"
                    />
                </Col>
                <Col className="d-flex" xl={1}>
                    {rowState.comparator !== 'HAS_NO_VALUE' && (
                        <TextInput
                            type="number"
                            className="form-control py-3 mt-0 bg-white-blue"
                            initialValue={rowState.valueToCompare}
                            onChange={handleValueToCompareChange}
                        />
                    )}
                    {isFirst ? null : (
                        <div className="ms-3">
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
    idx,
    rowState
}) => {
    const handleTypeChange = (newType) => handleRowDataChange({type: newType});
    const handleAddressChange = (newAddress) =>
        handleRowDataChange({address: newAddress});

    return (
        <Row className="my-3 align-items-center" key={idx}>
            <Col xl={1}>{isFirst ? <LabelBox text="SEND TO" /> : null}</Col>
            <Col xl={2}>
                <Select
                    backgroundColor="white-blue"
                    initialValue={rowState.type}
                    onChange={handleTypeChange}
                    options={Object.values(NotificationTypes)}
                />
            </Col>
            <Col xl={8}>
                <TextInput
                    className={inputStyling}
                    initialValue={rowState.address}
                    onChange={handleAddressChange}
                    placeholder="Enter email"
                />{' '}
            </Col>
            <Col xl={1}>
                {isFirst ? (
                    <AddButton onClick={handleAddRow} />
                ) : (
                    <BinButton onClick={handleDeleteRow} />
                )}
            </Col>
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
                <Row className="my-3">
                    <Col xl={1}>
                        <LabelBox text="TAGS" />
                    </Col>
                </Row>
                <Row className="my-3">
                    <AddButton onClick={handleAddRow} />
                </Row>
            </>
        );
    }

    return (
        <span key={idx}>
            <Row className="my-3">
                <Col xl={1}>{isFirst ? <LabelBox text="TAGS" /> : null}</Col>
                <Col xl={5}>
                    <TextInput
                        className={inputStyling}
                        initialValue={rowState.name}
                        onChange={handleNameChange}
                        placeholder="Enter tag name"
                    />{' '}
                </Col>
                <Col className="d-flex" xl={6}>
                    <div className="flex-grow-1">
                        <TextInput
                            className={inputStyling}
                            initialValue={rowState.value}
                            onChange={handleValueChange}
                            placeholder="Enter tag value"
                        />{' '}
                    </div>
                    <div className="ms-3">
                        <BinButton onClick={handleDeleteRow} />
                    </div>
                </Col>
            </Row>
            {isLast ? (
                <Row className="my-3">
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

const AddAlertPage = ({timeStore}) => {
    const model = useModel();
    const allSqlFilters = useAllSqlFilters();

    const conditionInitialValue = {
        logicalOperator: LogicalOperators.AND.value,
        metric: Object.values(getMetricsForModel(model.mlModelType))[0].value,
        comparator: Comparators.IS_ABOVE_OR_EQUAL.value
    };
    const recipientInitialValue = {type: NotificationTypes.EMAIL.value};
    const history = useHistory();
    const [tags, setTags] = useState([{}]);
    const [recipients, setRecipients] = useState([recipientInitialValue]);
    const [message, setMessage] = useState('');
    const [alertName, setAlertName] = useState('');
    const [conditions, setConditions] = useState([conditionInitialValue]);
    const [evaluationPeriod, setEvaluationPeriod] = useState(
        IsoDurations.PT5M.value
    );
    const [conditionsPeriod, setConditionsPeriod] = useState('');
    const [addAlertInProgress, setAddAlertInProgress] = useState(false);
    const [alertType, setAlertType] = useState(AlertTypes.THRESHOLD.value);
    const [autoResolve, setAutoResolvePeriod] = useState(
        AlertAutoResolvePeriods.NEVER.value
    );
    const [stateForNoDateOrNullValues, setStateForNoDateOrNullValues] = useState(
        AlertErrorHandlingStatuses.ALERTING.value
    );
    const [stateExecutionErrorOrTimeout, setStateExecutionErrorOrTimeout] = useState(
        AlertErrorHandlingStatuses.ALERTING.value
    );

    const goToPreviousRoute = useCallback(() => {
        history.goBack();
    }, []);

    const handleCreate = () => {
        setAddAlertInProgress(true);
        baseJSONClient('/api/tasks/alert', {
            method: 'POST',
            body: {
                name: alertName,
                type: alertType,
                evaluation_period: evaluationPeriod,
                conditions,
                modelType: model.mlModelType,
                sqlFilters: allSqlFilters
            }
        }).then(() => {
            setAddAlertInProgress(false);
            goToPreviousRoute();
        });
    };

    return (
        <Container className="py-5 px-4" fluid>
            <Row>
                <Col className="d-flex align-items center" lg={12}>
                    <h3 className="text-dark bold-text flex-grow-1">Add Alert</h3>
                    <BtnIcon
                        className="text-dark border-0"
                        icon={IconNames.CLOSE}
                        onClick={goToPreviousRoute}
                        size={20}
                    />
                </Col>
            </Row>
            <Row className="py-5  justify-content-between">
                <Col className="d-flex align-items-center" xl={8}>
                    <div>
                        {
                            <h6 className="mb-0 text-dark bold-text">
                                {'Alert name'}
                            </h6>
                        }
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <TextInput
                            className={inputStyling}
                            onChange={setAlertName}
                            placeholder="Enter Alert Name"
                        />{' '}
                    </div>
                </Col>
                <Col className="d-flex align-items-center" xl={4}>
                    <div>
                        {
                            <h6 className="mb-0 text-dark bold-text">
                                {'Evaluate every'}
                            </h6>
                        }
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <Select
                            backgroundColor="white"
                            initialValue={IsoDurations.PT5M.value}
                            isTextBold
                            onChange={setEvaluationPeriod}
                            options={Object.values(IsoDurations)}
                            textColor="primary"
                        />
                    </div>
                </Col>
            </Row>
            <div className="border-bottom border-bottom-2"></div>
            <FormSection name="Conditions">
                <Col className="mt-2" xl={12}>
                    <DynamicArray
                        data={conditions}
                        newRowInitialState={conditionInitialValue}
                        onChange={setConditions}
                        renderRow={ConditionRow}
                    />
                </Col>
            </FormSection>
            <div className="border-bottom border-bottom-2"></div>
            <Row className="pt-4">
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
                                    !condition.valueToCompare ||
                                    condition.valueToCompare === ''
                                );
                            }).length !== 0
                        }
                        className="w-100 p-3 text-white"
                        onClick={handleCreate}
                        variant="primary"
                    >
                        CREATE
                    </Button>
                </Col>
                <Col xl={2}>
                    <Button
                        className="w-100 p-3 text-secondary"
                        onClick={goToPreviousRoute}
                        variant="light"
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
