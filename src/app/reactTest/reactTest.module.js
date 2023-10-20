// For project setup with this migration I am following this guide:
// https://codecraft.tv/courses/angularjs-migration/step-2-typescript-and-webpack/using-webpack/
// This is also helpful:
// https://medium.com/hoopeez/the-deep-dive-migration-from-angular-to-react-ea5a807e95eb
// Dev dependencies that worked for their project (we are around the same webpack version so hoping for good luck)
// "devDependencies": {
//   "bower": "^1.8.0",
//   "json-server": "^0.9.6",
//   "rimraf": "^2.6.2",
//   "serve": "^5.1.2",
//   "ts-loader": "^3.2.0",
//   "typescript": "^2.6.2",
//   "webpack": "^3.10.0"
// }

/* global angular */

import sharedModule from "../shared/shared.module";
import ReactTestRouteConfig from "./reactTest.route";
import ReactTest from "./reactTest.react.component";
import { react2angular } from 'react2angular'

export default angular.module('tinyhands.reactTest', [sharedModule])
    .config(ReactTestRouteConfig)
    // CHANGE! use .component instead of .controller, as if we were using an Angular 1.5 component
    // With this react library, we are wrapping real react in an AngularJS 1.5 component
    .component('reactTest', react2angular(ReactTest,
        // Props passed in via <ReactTest prop1="test" />
        // Since this is a routed component, it shouldn't have any
        [],
        // Angular services, etc, passed into React component (also via props)
        ['LocationService']))
    .name
