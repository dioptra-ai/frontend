import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

const Tabs = ({tabs = []}) => {
    const [active, setActive] = useState(tabs[0]);

    return (
        <Container className='border-bottom' fluid>
            <div className='d-flex pt-4' >
                {tabs.map((tab, i) => (
                    <div
                        className={`tab ${active === tab ? 'active text-primary' : ''}`}
                        key={i}
                        onClick={() => setActive(tab)}
                    >
                        {tab}
                        <span
                            className={`d-block mt-4 border-bottom border-4 rounded-top ${
                                active === tab ? 'border-primary' : 'border-white'
                            }`}
                        ></span>
                    </div>
                ))}
            </div>
        </Container>

    );
};

Tabs.propTypes = {
    initial: PropTypes.string,
    tabs: PropTypes.array
};

export default Tabs;
