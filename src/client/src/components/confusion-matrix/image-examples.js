import PropTypes from 'prop-types';
import {IconNames} from 'constants';
import useModal from 'customHooks/useModal';
import BtnIcon from 'components/btn-icon';
import CustomCarousel from 'components/carousel';
import Modal from 'components/modal';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import TabularExamples from './tabular-examples';

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
                renderData={(data) => data.every((img) => img['feature.image_url'].match(/^https?:\/\//)) ? (
                    <CustomCarousel
                        items={data.map((x) => x['feature.image_url'].replace(/"/g, ''))}
                        onItemClick={setExampleInModal}
                    />
                ) : (
                    <TabularExamples
                        groundtruth={groundtruth}
                        onClose={onClose}
                        prediction={prediction}
                    />
                )
                }
                sql={sql`
                        SELECT distinct "feature.image_url"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE groundtruth = '${groundtruth}' AND prediction = '${prediction}'
                        AND ${allSqlFilters}
                        LIMIT 20
                    `}
            />
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setExampleInModal(null)}>
                    <div className='d-flex align-items-center'>
                        <p className='m-0 flex-grow-1'></p>
                        <BtnIcon
                            className='border-0'
                            icon={IconNames.CLOSE}
                            onClick={() => setExampleInModal(null)}
                            size={15}
                        />
                    </div>
                    <img
                        alt='Example'
                        className='rounded modal-image'
                        src={exampleInModal}
                        width='100%'
                    />
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
