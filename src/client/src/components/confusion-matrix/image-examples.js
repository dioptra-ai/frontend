import PropTypes from 'prop-types';
import {IconNames} from 'constants';
import useModal from 'customHooks/useModal';
import BtnIcon from 'components/btn-icon';
import CustomCarousel from 'components/carousel';
import Modal from 'components/modal';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';

const ImageExamples = ({onClose, groundtruth, prediction}) => {
    const [exampleInModal, setExampleInModal] = useModal(false);
    const allSqlFilters = useAllSqlFilters();

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
            <TimeseriesQuery

                defaultData={[]}
                renderData={(data) => (
                    <CustomCarousel
                        items={data.map((x) => x['feature.image_url'].replace(/"/g, ''))}
                        onItemClick={setExampleInModal}
                    />
                )}
                sql={sql`
                        SELECT distinct "feature.image_url"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE groundtruth = '${groundtruth}' AND prediction = '${prediction}'
                        AND ${allSqlFilters}
                        LIMIT 20
                    `}
            />
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
    groundtruth: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    prediction: PropTypes.string.isRequired
};

export default ImageExamples;
