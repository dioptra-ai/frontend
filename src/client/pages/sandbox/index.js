import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapsible from 'react-collapsible';
import {BsChevronDown, BsChevronUp} from 'react-icons/bs';
import md5 from 'md5';

import Menu from 'components/menu';
import Async from 'components/async';
import {PreviewImageClassification} from 'components/preview-image-classification';
import PreviewTextClassification from 'components/preview-text-classification';
import GeneralSearchBar from 'pages/common/general-search-bar';
import FilterInput from 'pages/common/filter-input';
import baseJSONClient from 'clients/base-json-client';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import {setupComponent} from 'helpers/component-helper';

const Sandbox = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();

    useSyncStoresToUrl(({filtersStore, segmentationStore, timeStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    return (
        <Menu>
            <GeneralSearchBar/>
            <div className='text-dark p-2'>
                <div style={{fontSize: 24}}>
                    Sandbox
                </div>
                <div className='bg-white'>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                    <Async
                        fetchData={() => baseJSONClient('/api/metrics/sandbox-analysis', {
                            method: 'post',
                            body: {
                                sql_filters: allSqlFilters
                            }
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => (
                            <Container fluid>
                                {data.length === 0 ? (
                                    <span>No data</span>
                                ) : null}
                                <Row className='g-2'>
                                    {data.map((d, i) => {
                                        let preview = null;

                                        if (d['image_metadata.uri']) {
                                            if (d['prediction'] || d['groundtruth']) {
                                                // IMAGE_CLASSIFICATION
                                                preview = <PreviewImageClassification sample={d} height={200}/>;
                                            }
                                        } else if (d['text']) {
                                            if (d['prediction'] || d['groundtruth']) {
                                                // TEXT_CLASSIFICATION
                                                preview = <PreviewTextClassification sample={d}/>;
                                            }
                                        }

                                        return (
                                            <Col key={md5(`${JSON.stringify(d)};${i}`)} xs={6} md={4} xl={3}>
                                                <div className='p-2 bg-white-blue border rounded'>
                                                    {preview}
                                                    <Collapsible
                                                        open={!preview}
                                                        transitionTime={1}
                                                        trigger={<a className='text-dark text-decoration-underline'>Details<BsChevronDown/></a>}
                                                        triggerWhenOpen={<a className='text-dark text-decoration-underline'>Details<BsChevronUp/></a>}
                                                    >
                                                        <pre>{JSON.stringify(d, null, 4)}</pre>
                                                    </Collapsible>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Container>
                        )}
                    />
                </div>
            </div>
        </Menu>
    );
};

Sandbox.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(Sandbox);
