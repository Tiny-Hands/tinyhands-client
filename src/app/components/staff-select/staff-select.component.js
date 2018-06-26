import StaffSelectTemplateUrl from './staff-select.html';

export class StaffSelectController {
    constructor(StaffService) {
        'ngInject';
        this.StaffService = StaffService;

        this.getStaff();
    }

    filterStaffByFirstAndLastName(staff, value) {
        if (staff && value) {
            let searchValue = value.toLowerCase();
            let matchFirstName = _.includes(('' + staff.first_name).toLowerCase(), searchValue);
            let matchLastName = _.includes(('' + staff.last_name).toLowerCase(), searchValue);
            let matchFirstAndLastName = _.includes((staff.first_name + ' ' + staff.last_name).toLowerCase(), searchValue);
            return matchFirstName || matchLastName || matchFirstAndLastName;
        }
        return false;
    }

    getStaff() {
        this.StaffService.getStaff().then(response => {
            this.staff = response.data.results;
        });
    }
}

export default {
    bindings: {
        selectedStaff: '='
    },
    controller: StaffSelectController,
    templateUrl: StaffSelectTemplateUrl,
    transclude: true
};