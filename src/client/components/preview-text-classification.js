import PropTypes from 'prop-types';
import Collapsible from 'react-collapsible';
import {BsChevronDown, BsChevronUp} from 'react-icons/bs';

const PreviewTextClassification = ({sample, ...rest}) => { // eslint-disable-line no-unused-vars

    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <td className='fw-bold'>Text</td>
                        <td className='ps-1'>
                            <Collapsible
                                transitionTime={1} classParentString='Collapsible-min-height-100'
                                trigger={<a className='text-dark text-decoration-underline'>more... <BsChevronDown/></a>}
                                triggerWhenOpen={<a className='text-dark text-decoration-underline'>less... <BsChevronUp/></a>}
                            >
                                {sample['text']}
                            </Collapsible>
                        </td>
                    </tr>
                    <tr>
                        <td className='fw-bold'>Prediction</td>
                        <td className='ps-1'>{sample['prediction']}</td>
                    </tr>
                    <tr>
                        <td className='fw-bold'>Ground Truth</td>
                        <td className='ps-1'>{sample['groundtruth']}</td>
                    </tr>
                </tbody>
            </table>
            <style dangerouslySetInnerHTML={{__html: `
                .Collapsible-min-height-100 {
                    display: flex;
                    flex-flow: column-reverse;
                }
                .Collapsible-min-height-100__contentOuter {
                    min-height: 100px;
                }
        `}}/>
        </>
    );
};

PreviewTextClassification.propTypes = {
    sample: PropTypes.object.isRequired
};

export default PreviewTextClassification;
