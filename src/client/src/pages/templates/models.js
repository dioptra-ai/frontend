import {Link} from 'react-router-dom';
import GeneralSearchBar from './general-search-bar';
import React from 'react';

const Models = () => {
    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput={true} />
            <Link to='/models/1/performance-overview'>Go to Model</Link>
        </>
    );
};

export default Models;
