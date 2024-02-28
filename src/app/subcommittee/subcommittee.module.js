import sharedModule from '../shared/shared.module';

import subcommitteeRouteConfig from './subcommittee.route';
import SubcommitteeService from './subcommittee.service.js';
import SubcommitteeController from './subcommittee.controller';

import SubcommitteeListController from './list/subcommitteeList.controller';

export default angular.module('tinyhands.Subcommittee', [sharedModule])
    .config(subcommitteeRouteConfig)
    .controller('SubcommitteeListController', SubcommitteeListController)
    .controller('subcommitteeController', SubcommitteeController)
    .service('SubcommitteeService', SubcommitteeService)
    .name;
