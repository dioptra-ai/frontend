import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

const Breadcrumb = ({links = []}) => {
    return (
        <Container className='bg-light text-secondary py-4' fluid>
            <div className='breadcrumb m-0'>
                {links.map((link, i) => (
                    <span className='link' key={i}>
                        <Link className='text-secondary' to={link.path}>
                            {link.name}
                        </Link>
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
