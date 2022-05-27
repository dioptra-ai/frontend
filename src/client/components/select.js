import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

const Select = ({options = [], onChange, ...rest}) => {

    return (
        <Form.Control as='select' className='form-select'{...rest} onChange={(e) => {
            onChange?.(e.target.value);
        }}>
            {
                options.map(({name, value}) => (
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
    onChange: PropTypes.func
};

export default Select;
