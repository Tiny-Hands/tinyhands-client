// Changed this inspection to .ts which helped my IDE read the types from it
// However, no typescript was added to this file, just the extension change
// noinspection TypeScriptUnresolvedVariable
// @ts-nocheck

export default class IrfNewListService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }

    getIrfList(queryParameters) {
        return this.service.get('api/irfNew/', queryParameters);
    }
    
    getUserCountries(id) {
    	return this.service.get(`api/user_permission/countries/${id}/?permission_group=IRF&form_present=true`);
    }
    
    getUserStationsForAdd(id) {
    	return this.service.get(`api/user_permission/stations/${id}/?permission_group=IRF&form_present=true&action=ADD`);
    }

    getMoreIrfs(queryParameters) {
        return this.service.get('api/irfNew/', queryParameters);
    }

    deleteIrf(stationId, id){
        return this.service.delete(`api/irfNew/${stationId}/${id}/`);
    }

    irfExists(irfNumber) {
        return this.service.post(`data-entry/irfs/irfExists/${irfNumber}`);
    }

    getCsvExport() {
        return this.service.get('api/irf/export/');
    }
    
    getFormForStation(stationId) {
    	return this.service.get('api/forms/?type_name=IRF&station_id=' + stationId);
    	
    }
    
    getConfigForForm(formId) {
    	return this.service.get(`api/forms/config/${formId}`);
    }
}
