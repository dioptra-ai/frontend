import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

const Select = ({options = [], onChange, children, className, ...rest}) => {

    return (
        <Form.Control as='select' className={`${className} form-select w-100`} {...rest} onChange={(e) => {
            if (onChange) {
                if (rest.multiple) {
                    onChange(Array.from(e.target.selectedOptions).map(({value}) => value));
                } else {
                    onChange(e.target.value);
                }
            }
        }}>
            {
                children || options.map(({name, value}) => (
                    <option value={value} key={value}>{name || value}</option>
                ))
            }
        </Form.Control>
    );
};

Select.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.node,
        value: PropTypes.any
    })),
    onChange: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string
};

export default Select;
