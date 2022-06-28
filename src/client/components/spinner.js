import PropTypes from 'prop-types';
import BarLoader from 'react-spinners/BarLoader';
import {AsyncContext} from 'components/async';

const Spinner = ({size = 150}) => (
    <AsyncContext.Consumer>
        {(asyncContext) => (
            (asyncContext?.loading || !asyncContext) ? (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
                    <BarLoader loading size={size}/>
                </div>
            ) : null
        )}
    </AsyncContext.Consumer>
);

Spinner.propTypes = {
    size: PropTypes.number,
    standalone: PropTypes.bool
};

export default Spinner;

export const SpinnerWrapper = ({children, ...rest}) => (
    <div style={{position: 'relative', width: '100%'}} {...rest}>
        <Spinner/>
        {children}
    </div>
);

SpinnerWrapper.propTypes = {
    children: PropTypes.node
};
