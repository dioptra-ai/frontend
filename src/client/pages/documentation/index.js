import htmlContent from 'build/documentation/index.html';

const Documentation = () => {
    return (
        <div dangerouslySetInnerHTML={ {__html: htmlContent} } />
    );
};

export default Documentation;
