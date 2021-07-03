import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import {Link, useLocation} from 'react-router-dom';

const Tabs = ({tabs = []}) => {
    const pathname = useLocation().pathname;

    return (
        <Row className='border-bottom'>
            <div className='d-flex pt-4' >
                {tabs.map((tab, i) => (
                    <Link
                        className={`tab ${pathname === tab.path ? 'active text-primary' : 'text-dark'}`}
                        key={i}
                        to={tab.path}
                    >
                        {tab.name}
                        <span
                            className={`d-block mt-4 border-bottom border-4 rounded-top ${
                                pathname === tab.path ? 'border-primary' : 'border-white'
                            }`}
                        ></span>
                    </Link>
                ))}
            </div>
        </Row>

    );
};

Tabs.propTypes = {
    tabs: PropTypes.array
};

export default Tabs;
