import subcommitteeListTemplate from './list/subcommitteeList.html';
import subcommitteeTemplate from './subcommittee.html';

function subcommitteeRouteConfig($stateProvider) {
    'ngInject';
    $stateProvider
        .state('subcommittee', {
            url: '/subcommittee/?id&isViewing',
            templateUrl: subcommitteeTemplate,
            controller: 'subcommitteeController',
            controllerAs: '$ctrl',
            params: {
                id: null
            }
        })
        .state('subcommitteeList', {
	    	url: '/subcommitteeList?search',
		      templateUrl: subcommitteeListTemplate,
		      controller: 'SubcommitteeListController',
		      controllerAs: 'listCtrl',
	    });
}

export default subcommitteeRouteConfig;