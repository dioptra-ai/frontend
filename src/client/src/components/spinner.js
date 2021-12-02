import PropTypes from 'prop-types';
import BarLoader from 'react-spinners/BarLoader';
import {AsyncContext} from 'components/async';

const Spinner = ({size = 150}) => (
    <AsyncContext.Consumer>
        {({loading} = {}) => (
            loading ? (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10

                }}>
                    <BarLoader
                        loading
                        size={size}
                    />
                </div>
            ) : null
        )}
    </AsyncContext.Consumer>
);

Spinner.propTypes = {
    size: PropTypes.number
};

export default Spinner;

export const SpinnerWrapper = ({children}) => (
    <div style={{position: 'relative', width: '100%'}}>
        <Spinner/>
        {children}
    </div>
);

SpinnerWrapper.propTypes = {
    children: PropTypes.node
};
