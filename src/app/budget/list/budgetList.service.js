export default class BudgetListService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }

    deleteBorderStationBudget(id) {
        return this.service.delete(`api/budget/${id}/`);
    }

    getBudgetList(searchTerm, sortValue, country_ids, nextPage) {
        let params = [{ name: "page_size", value: "25" }, { name: "search", value: searchTerm }, { name: "ordering", value: sortValue }];
        if (country_ids !== null && country_ids !== '') {
            params.push({name:"country_ids", value:country_ids});
        }
        if (nextPage !== null) {
            params.push({name:"page", value:nextPage});
        }
        return this.service.get('api/budget/', params);
    }

    getNextBudgetPage(nextPageUrl) {
        return this.service.get(nextPageUrl);
    }

    getMdf(id, mdf_type) {
        return this.service.get(`api/mdf/${id}/?mdf_type=${mdf_type}`);
    }

    sendMdfEmails(people) {
        return this.service.post(`api/mdf/${people.budget_id}/`, people);
    }
    
    getUserCountries(id) {
        return this.service.get(`api/user_permission/countries/${id}/?permission_group=BUDGETS`);
    }
    
    getUserStationsForAdd(id) {
        return this.service.get(`api/user_permission/stations/${id}/?permission_group=BUDGETS&form_type=MDF&form_present=true&action=ADD`);
    }

}
