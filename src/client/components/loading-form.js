import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import BarLoader from 'react-spinners/BarLoader';

import Error from 'components/error';

export const LoadingFormContext = React.createContext();

const LoadingForm = ({onSubmit, ...rest}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        try {
            setError(null);
            setLoading(true);
            await onSubmit(e);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoadingFormContext.Provider value={{loading, error}}>
            <Form onSubmit={handleSubmit} {...rest}/>
        </LoadingFormContext.Provider>
    );
};

LoadingForm.propTypes = {
    onSubmit: PropTypes.func
};

export default LoadingForm;

const LoadingFormButton = ({children, ...rest}) => {

    return (
        <LoadingFormContext.Consumer>
            {({loading}) => loading ? (
                <Button disabled {...rest}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <BarLoader loading size={150}/>
                    </div>
                </Button>
            ) : (
                <Button {...rest}>{children}</Button>
            )}
        </LoadingFormContext.Consumer>
    );
};

LoadingFormButton.propTypes = {
    children: PropTypes.node
};

LoadingForm.Button = LoadingFormButton;

const LoadingFormError = () => (
    <LoadingFormContext.Consumer>
        {({error}) => error ? (
            <Error error={error}/>
        ) : null}
    </LoadingFormContext.Consumer>
);

LoadingForm.Error = LoadingFormError;
