import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

const Breadcrumb = ({links = []}) => {
    return (
        <Container className='bg-white-blue text-secondary py-2' fluid>
            <div className='breadcrumb m-0 px-3'>
                {links.map(({name, path}, i) => (
                    <span className='link' key={i}>
                        <a
                            className='text-secondary bold-text fs-7'
                            onClick={typeof path === 'function' ? () => path() : null}
                            to={typeof path === 'function' ? null : path}
                        >
                            {name}
                        </a>
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
