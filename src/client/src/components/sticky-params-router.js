import PropTypes from 'prop-types';
import {useEffect} from 'react';
import {BrowserRouter, useHistory, useLocation} from 'react-router-dom';

import {setupComponent} from 'helpers/component-helper';

////////////////////////////////////////////////////////////////////
/// Flow of data for parameters that are persisted in locaStorage
/// and are sticky in URLs of a particular subset of the routes.
///
// URL             localStorage        <TimePicker/>     timeStore    <StickyParamsRouter/>
//
//                                                 constructor
//  --------------------------------------------------------->
//                                                 constructor
//                      ------------------------------------->
//
//                                             handleChange
//                                             --------------->
//                                                 setTimeRange
//                      <----------------------------------
//                                                 setTimeRange
//                                                 -------------------------->
//                                                                   useEffect
//  <-------------------------------------------------------------------------
//
const _StickyParams = ({getParamsFromStores, ...stores}) => {
    const history = useHistory();
    const location = useLocation();
    const paramsFromStores = getParamsFromStores(stores);

    useEffect(() => {

        history.replace({
            search: `?${new URLSearchParams(paramsFromStores).toString()}`
        });
    }, [JSON.stringify(paramsFromStores), location.pathname]);

    return null;
};

const StickyParams = setupComponent(_StickyParams);

const StickyParamsRouter = ({getParamsFromStores, children, ...rest}) => (
    <BrowserRouter {...rest}>
        <StickyParams getParamsFromStores={getParamsFromStores}/>
        {children}
    </BrowserRouter>
);

StickyParamsRouter.propTypes = {
    children: PropTypes.func.node,
    getParamsFromStores: PropTypes.func.isRequired
};

export default StickyParamsRouter;
