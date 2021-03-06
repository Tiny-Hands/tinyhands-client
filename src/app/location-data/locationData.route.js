import locationDataTemplate from './locationData.html';
import './locationData.less';

function locationDataRoutes($stateProvider) {
    'ngInject';
    $stateProvider
        .state('locationData', {
            url: '/locationData',
            templateUrl: locationDataTemplate,
            controller: 'LocationDataController',
            controllerAs: 'vm',
        });
}

export default locationDataRoutes;