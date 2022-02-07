import htmlContent from './build/index.html';

const Documentation = () => {
    return (
        <div dangerouslySetInnerHTML={ {__html: htmlContent} } />
    );
};

export default Documentation;
