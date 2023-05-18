import PropTypes from 'prop-types';
import BarLoader from 'react-spinners/BarLoader';

import {AsyncContext} from 'components/async';

const Spinner = ({size = 150}) => (
    <AsyncContext.Consumer>
        {(asyncContext) => (
            (!asyncContext ? (
                <div style={{position: 'relative', width: '100%', height: '100%', minHeight: 10}}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%'
                    }}>
                        <BarLoader loading size={size}/>
                    </div>
                </div>
            ) : asyncContext.loading ? (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    minHeight: 10
                }}>
                    <BarLoader loading size={size} />
                </div>
            ) : null)
        )}
    </AsyncContext.Consumer>
);

Spinner.propTypes = {
    size: PropTypes.number,
    standalone: PropTypes.bool
};

export default Spinner;
