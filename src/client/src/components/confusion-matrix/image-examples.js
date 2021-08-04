import PropTypes from 'prop-types';
import {IconNames} from 'constants';
import useModal from 'customHooks/useModal';
import BtnIcon from 'components/btn-icon';
import CustomCarousel from 'components/carousel';
import Modal from 'components/modal';

const ImageExamples = ({onClose, images}) => {
    const [exampleInModal, setExampleInModal] = useModal(false);

    return (
        <div className='bg-white-blue my-3 p-3'>
            <div className='d-flex align-items-center mb-5'>
                <p className='text-dark m-0 bold-text flex-grow-1'>Examples</p>
                <BtnIcon
                    className='text-dark border-0'
                    icon={IconNames.CLOSE}
                    onClick={onClose}
                    size={15}
                />
            </div>
            <CustomCarousel items={images} onItemClick={(example) => setExampleInModal(example)}/>
            {exampleInModal && (
                <Modal>
                    <div className='d-flex align-items-center'>
                        <p className='m-0 flex-grow-1'></p>
                        <BtnIcon
                            className='border-0'
                            icon={IconNames.CLOSE}
                            onClick={() => setExampleInModal(null)}
                            size={15}
                        />
                    </div>
                    <img alt='Example' className='rounded' src={exampleInModal} width='100%'/>
                </Modal>
            )}
        </div>

    );
};

ImageExamples.propTypes = {
    images: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ImageExamples;
