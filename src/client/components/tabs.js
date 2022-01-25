import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import {NavLink} from 'react-router-dom';

const Tabs = ({tabs = []}) => {
    return (
        <Row className='border-bottom px-3'>
            <div className='d-flex pt-3'>
                {tabs.map((tab, i) => (
                    <NavLink
                        activeClassName='active'
                        className='tab fs-5'
                        key={i}
                        to={tab.to}
                    >
                        {tab.name}
                        <span className='d-block mt-3 rounded-top'></span>
                    </NavLink>
                ))}
            </div>
        </Row>
    );
};

Tabs.propTypes = {
    tabs: PropTypes.array
};

export default Tabs;
