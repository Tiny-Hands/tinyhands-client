function PvfCommonV2022_6Routes($stateProvider) {
    'ngInject';
    $stateProvider
        .state('pvfNepal', {
            url: '/pvf/commonV2022_6:?id&stationId&countryId&isViewing&formName&incidentId',
            component: 'pvfCommon202206Component',
            params: {
                id: null
            }
        });
}

export default PvfCommonV2022_6Routes;