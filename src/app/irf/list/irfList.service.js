export default class IrfListService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }

    getIrfList(queryParameters) {
        return this.service.get('api/irf/', queryParameters);
    }

    getMoreIrfs(queryParameters) {
        return this.service.get('api/irf/', queryParameters);
    }

    deleteIrf(id){
        return this.service.delete(`api/irf/${id}/`);
    }

    irfExists(irfNumber) {
        return this.service.post(`data-entry/irfs/irfExists/${irfNumber}`);
    }

    getCsvExport() {
        return this.service.get('api/irf/export/');
    }
}
