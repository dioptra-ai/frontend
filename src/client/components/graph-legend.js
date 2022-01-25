import PropTypes from 'prop-types';

const Legend = ({data}) => {
    return (
        <ul className='graph-legend my-2 p-0'>
            {
                data.map((item, index) => (
                    <li className='text-secondary mx-2 fs-7' key={index}>
                        <span
                            className='square'
                            style={{backgroundColor: item.fill, opacity: item.fillOpacity}}
                        >
                        </span>
                        <p>{item.name}</p>
                    </li>
                ))
            }
        </ul>
    );
};

Legend.propTypes = {
    data: PropTypes.array
};

export default Legend;
