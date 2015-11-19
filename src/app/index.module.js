/* global toastr:false, moment:false */
import config from './index.config';

import routerConfig from './index.route';
import errorRoutes from './error/error.route';

import googleMapsConfig from './components/map/map.config';

import runBlock from './index.run';

// REGION: Services
import SessionService from './utils/session.service';
import TallyService from './components/tally/tally.service';
import Address2Service from './addresses/address2.service';
// ENDREGION: Services

// REGION: Directives
import MapDirective from './components/map/map.directive';
import NavbarDirective from './components/navbar/navbar.directive';
import TallyDirective from './components/tally/tally.directive';
// ENDREGION: Directives
  
// REGION: Controllers
import Address2Controller from './addresses/address2.controller';
import Address2EditModalController from './addresses/Address2EditModalController';
import DashboardController from './dashboard/dashboard.controller';
import LoginController from './login/login.controller';
// ENDREGION: Controllers

// REGION: Factories
import ErrorService from './error/error.factory';
// ENDREGION: Factories

angular.module('tinyhandsFrontend', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'uiGmapgoogle-maps'])
  .constant('toastr', toastr)
  .constant('moment', moment)
  .config(config)

  .config(routerConfig)
  .config(errorRoutes)

  .config(googleMapsConfig) // Pass google maps config

  .run(runBlock)

  // REGION: Services
  .service('address2Service', Address2Service)
  .service('session', SessionService)
  .service('tallyService', TallyService)
  // ENDREGION: Services

  // REGION: Factories
  .factory('ErrorHandler', ErrorService.errorFactory)
  // ENDREGION: Factories

  // REGION: Directives
  .directive('googlemap', () => new MapDirective())
  .directive('navbar', () => new NavbarDirective())
  .directive('tally', () => new TallyDirective())
  // ENDREGION: Directives
  
  // REGION: Controllers
  .controller('Address2Controller', Address2Controller)
  .controller('Address2EditModalController', Address2EditModalController)
  .controller('DashboardController', DashboardController)
  .controller('LoginController', LoginController)
  // ENDREGION: Controllers
;