import React, {useState} from 'react';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';
import {IconNames} from '../constants';

const Expandable = ({content, expandedContent}) => {
    const [expand, setExpand] = useState(false);

    return (
        <>
            <div className='d-flex align-items-center'>
                <div className='flex-grow-1'>{content}</div>
                <FontIcon
                    className='text-dark mx-3'
                    icon={expand ? IconNames.ARROW_UP : IconNames.ARROW_DOWN }
                    onClick={() => setExpand(!expand)}
                    size={7}
                />
            </div>
            <div className='bg-white-blue expand'>
                {expand && expandedContent}
            </div>
        </>
    );
};

Expandable.propTypes = {
    content: PropTypes.element,
    expandedContent: PropTypes.array
};

export default Expandable;
