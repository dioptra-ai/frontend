import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

const Breadcrumb = ({links = []}) => {
    return (
        <Container className='bg-white-blue text-secondary py-4' fluid>
            <div className='breadcrumb m-0 px-3'>
                {links.map(({name, path}, i) => (
                    <span className='link' key={i}>
                        {typeof path !== 'function' ? (
                            <Link className='text-secondary bold-text fs-7' to={path}>
                                {name}
                            </Link>
                        ) : (
                            <button
                                className='text-secondary bold-text fs-7'
                                onClick={() => path()}
                            >
                                {name}
                            </button>
                        )}
                    </span>
                ))}
            </div>
        </Container>
    );
};

Breadcrumb.propTypes = {
    links: PropTypes.array
};

export default Breadcrumb;
