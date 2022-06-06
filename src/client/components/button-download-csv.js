import PropTypes from 'prop-types';
import {saveAs} from 'file-saver';
import {IoDownloadOutline} from 'react-icons/io5';
import Button from 'react-bootstrap/Button';

import metricsClient from 'clients/metrics';

const ButtonDownloadCSV = ({uuids, filename = 'data.csv'}) => {

    return (
        <Button
            className='w-100 text-white btn-submit click-down mb-3'
            variant='secondary'
            onClick={async () => {
                const data = await metricsClient('datapoints', {
                    uuids,
                    as_csv: true
                });

                saveAs(new Blob([data], {type: 'text/csv;charset=utf-8'}), filename);
            }}>
            <IoDownloadOutline className='fs-2 cursor-pointer'/> Download as CSV
        </Button>
    );
};

ButtonDownloadCSV.propTypes = {
    uuids: PropTypes.array.isRequired,
    filename: PropTypes.string
};

export default ButtonDownloadCSV;
