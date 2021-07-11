import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import FontIcon from './font-icon';
import {IconNames} from '../constants';

const DropdownMenu = ({label, options, onClick}) => {
    return (
        <Dropdown>
            <Dropdown.Toggle
                bsPrefix='p-0'
                className='border-dark text-dark p-3 d-flex align-items-center align-left'
                style={{width: '200px'}}
                variant='white'
            >
                <span className='flex-grow-1' style={{textAlign: 'left'}}>{label}</span>
                <FontIcon
                    icon={IconNames.ARROW_DOWN}
                    size={6}
                />
            </Dropdown.Toggle>
            <Dropdown.Menu className='p-0 w-100'>
                {options.map((option, i) => (
                    <Dropdown.Item key={i} onClick={onClick}>{option}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

DropdownMenu.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    options: PropTypes.array
};

export default DropdownMenu;
