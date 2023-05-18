import PropTypes from 'prop-types';

const WhiteScreen = ({children}) => (
    <div className='d-flex flex-column justify-content-center align-items-center' style={{
        inset: 0,
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }}>{children}</div>
);

WhiteScreen.propTypes = {
    children: PropTypes.node
};

export default WhiteScreen;
