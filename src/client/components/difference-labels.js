import {IoCaretDownSharp, IoCaretUpSharp} from 'react-icons/io5';
import PropTypes from 'prop-types';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const DifferenceLabel = ({difference, containerStyle = {}, diffStyles = {}}) => {

    return (
        <div style={containerStyle} className='mx-2'>
            <OverlayTrigger overlay={<Tooltip>Benchmark comparison</Tooltip>}>
                <span className='text-secondary metric-box-diffText' style={{
                    fontSize: '80%',
                    whiteSpace: 'nowrap',
                    ...diffStyles
                }}>
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
            </OverlayTrigger>
        </div>
    );
};

DifferenceLabel.propTypes = {
    containerStyle: PropTypes.object,
    difference: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    diffStyles: PropTypes.object
};

export default DifferenceLabel;
