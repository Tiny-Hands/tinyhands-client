export default class BudgetListService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }

    deleteBorderStationBudget(id) {
        return this.service.delete(`api/budget/${id}/`);
    }

    getBudgetList(searchTerm, sortValue, country_ids) {
        let params = [{ name: "page_size", value: "25" }, { name: "search", value: searchTerm }, { name: "ordering", value: sortValue }];
        if (country_ids !== null && country_ids !== '') {
            params.push({name:"country_ids", value:country_ids})
        }
        return this.service.get('api/budget/', params);
    }

    getNextBudgetPage(nextPageUrl) {
        return this.service.get(nextPageUrl);
    }

    getMdf(id) {
        return this.service.get(`api/mdf/${id}/`);
    }

    sendMdfEmails(people) {
        return this.service.post(`api/mdf/${people.budget_id}/`, people);
    }
    
    getUserCountries(id) {
        return this.service.get(`api/user_permission/countries/${id}/?permission_group=BUDGETS`);
    }
    
    getUserStationsForAdd(id) {
        return this.service.get(`api/user_permission/stations/${id}/?permission_group=BUDGETS&action=ADD`);
    }

}
