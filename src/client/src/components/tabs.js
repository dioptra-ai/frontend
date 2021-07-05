import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import {NavLink} from 'react-router-dom';

const Tabs = ({tabs = []}) => {
    return (
        <Row className='border-bottom'>
            <div className='d-flex pt-4' >
                {tabs.map((tab, i) => (
                    <NavLink
                        activeClassName='active text-primary'
                        className='tab text-dark'
                        key={i}
                        to={tab.path}
                    >
                        {tab.name}
                        <span className='d-block mt-4 rounded-top'></span>
                    </NavLink >
                ))}
            </div>
        </Row>

    );
};

Tabs.propTypes = {
    tabs: PropTypes.array
};

export default Tabs;
