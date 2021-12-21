import {IoCaretDownSharp, IoCaretUpSharp} from 'react-icons/io5';
import PropTypes from 'prop-types';

const DifferenceLabel = ({difference, containerStyle = {}, diffStyles = {}}) => {
    return (
        <div style={containerStyle} className='mx-2'>
            <span className='text-secondary metric-box-diffText' style={{
                fontSize: '80%',
                whiteSpace: 'nowrap',
                ...diffStyles
            }} title='vs. Benchmark'>
                {Number(difference) ? (
                    Number(difference) > 0 ? (
                        <>
                            {`+${difference}%`}
                            <IoCaretUpSharp className='fs-6/'/>
                        </>
                    ) : (
                        <>
                            {`${difference}%`}
                            <IoCaretDownSharp className='fs-6/'/>
                        </>
                    )
                ) : ' ='}
            </span>
        </div>
    );
};

DifferenceLabel.propTypes = {
    containerStyle: PropTypes.object,
    difference: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    diffStyles: PropTypes.object
};

export default DifferenceLabel;
