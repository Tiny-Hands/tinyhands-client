import sharedModule from "../../shared/shared.module";
import ReactIrfListRouteConfig from "./reactIrfList.route";
import ReactIrfList from "./reactIrfList.react.component";
import { react2angular } from 'react2angular'

/* global angular */
export default angular.module('tinyhands.reactIrfList', [sharedModule])
    .config(ReactIrfListRouteConfig)
    // CHANGE! use .component instead of .controller, as if we were using an Angular 1.5 component
    // With this react library, we are wrapping real react in an AngularJS 1.5 component
    .component('reactIrfList', react2angular(ReactIrfList,
        // Props passed in via <ReactTest prop1="test" />
        // Since this is a routed component, it shouldn't have any
        [],
        // Angular services, etc, passed into React component (also via props)
        ['IrfNewListService', 'SessionService', '$stateParams', '$uibModal', 'StickyHeader',
            'SpinnerOverlayService', '$state', '$timeout', 'toastr', 'constants', 'moment']))
    .name