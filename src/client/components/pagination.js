import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

const Pagination = ({totalPages, onPageChange, overrideSelectedPage = 1}) => {
    const pages = Array.from({length: totalPages}, (_, i) => 1 + i);
    const [selectedPage, setSelectedPage] = useState(overrideSelectedPage);
    const [page, setPage] = useState('');

    useEffect(() => {
        onPageChange(selectedPage);
    }, [selectedPage]);

    return totalPages ? (
        <div className='pagination my-3 fs-6'>
            <div className='pages'>
                <button
                    className='px-0'
                    disabled={selectedPage === 1}
                    onClick={() => setSelectedPage(selectedPage - 1)}
                >
                Previous
                </button>
                {pages.map((page, i) => {
                    return (
                        <button
                            className={`fs-6 ${selectedPage === page ? 'selected' : ''}`}
                            disabled={selectedPage === page}
                            key={i}
                            name={page}
                            onClick={(e) => setSelectedPage(parseFloat(e.currentTarget.name))}
                        >
                            {page}
                        </button>
                    );
                })}
                <button
                    className='px-0'
                    disabled={selectedPage === totalPages}
                    onClick={() => setSelectedPage(selectedPage + 1)}
                >
                Next
                </button>
            </div>
            <div className='go-to-page'>
                Go to Page
                <input className='mx-2 text-secondary' onChange={(e) => setPage(e.target.value)} type='number' value={page}/>
                <Button className='text-secondary' onClick={() => {
                    setSelectedPage(parseFloat(page));
                    setPage('');
                }} variant='light'>GO</Button>
            </div>

        </div>
    ) : null;
};

Pagination.propTypes = {
    onPageChange: PropTypes.func,
    selectedPage: PropTypes.number,
    totalPages: PropTypes.number,
    overrideSelectedPage: PropTypes.number
};

export default Pagination;
