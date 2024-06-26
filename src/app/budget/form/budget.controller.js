import Constants from './constants.js';

import salariesForm from './components/salaries/salariesForm.html';
import travelForm from './components/travel/travelForm.html';
import administrationForm from './components/administration/administrationForm.html';
import potentialVictimCareForm from './components/potentialVictimCare/potentialVictimCareForm.html';
import suppliesAwarenessForm from './components/suppliesAwareness/suppliesAwarenessForm.html';
import pastMonth from './components/pastMonth/pastMonthSentMoneyForm.html';
import moneyNotSpentForm from './components/moneyNotSpent/moneyNotSpent.html';
import impactMultiplyingForm from './components/impactMultiplying/impactMultiplying.html';
import rentUtilitiesForm from './components/rentUtilities/rentUtilities.html';

import categoryTemplate from './components/salaries/category.html';
import detailTemplate from './detail.html';

import CategoryModalController from './components/salaries/categoryModal.controller';
import DetailModalController from './detailModal.controller';

class Tracking {
    constructor(shouldFinalize=false) {
        this.count = 0;
        this.errors = 0;
        this.finalize = shouldFinalize;
    }
    
    startRequest() {
        this.count += 1;
    }
    
    completeRequest(error=false) {
        this.count -= 1;
        if (error) {
            this.errors += 1;
        }
    }
    
    allRequestsCompleted() {
        return this.count === 0;
    }
    
    hasErrors() {
        return this.errors !== 0;
    }
    
    shouldFinalize() {
        return this.count === 0 && this.errors === 0 && this.finalize;
    }
};

export default class BudgetController {
    constructor($state, $stateParams,  $uibModal, BudgetService, UtilService, toastr, $scope) {
        'ngInject';

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$uibModal = $uibModal;
        this.service = BudgetService;
        this.utils = UtilService;
        this.toastr = toastr;
        this.currency = '';
        this.modified = false;
        this.scope = $scope;

        this.sections = {
            allSections: [
                { name: 'Salaries & Benefits', templateUrl: salariesForm, value: Constants.FormSections.Salaries },
                { name: 'Rent & Utilities', templateUrl: rentUtilitiesForm, value: Constants.FormSections.RentUtilities },
                { name: 'Administration', templateUrl: administrationForm, value: Constants.FormSections.Administration },
                { name: 'Supplies & Awareness', templateUrl: suppliesAwarenessForm, value: Constants.FormSections.Awareness },
                { name: 'Staff Travel', templateUrl: travelForm, value: Constants.FormSections.Travel },
                { name: 'PV Care', templateUrl: potentialVictimCareForm, value: Constants.FormSections.PotentialVictimCare },
                { name: 'Impact Multiplying', templateUrl: impactMultiplyingForm, value: Constants.FormSections.ImpactMultiplying },
            ],
            excludeFromDropDown: [
                'Past Month Sent Money',
                'Money Not Spent',
                'Impact Multiplying',
            ]
        };

        this.months = [
            { name: 'January', value: 1 },
            { name: 'February', value: 2 },
            { name: 'March', value: 3 },
            { name: 'April', value: 4 },
            { name: 'May', value: 5 },
            { name: 'June', value: 6 },
            { name: 'July', value: 7 },
            { name: 'August', value: 8 },
            { name: 'September', value: 9 },
            { name: 'October', value: 10 },
            { name: 'November', value: 11 },
            { name: 'December', value: 12 },
        ];

        this.active = null;
        this.borderMonitoringStationTotal = 0;
        this.budgetId = $stateParams.id;
        if ($stateParams.borderStationId) {
            this.borderStationId = parseInt($stateParams.borderStationId);
        }

        this.month = parseInt(window.moment().format('M'));
        this.year = parseInt(window.moment().format('YYYY'));

        this.deletedItems = [];
        this.form = {
            other: {},
            totals: {
                borderMonitoringStation: {
                },
                other: {},
                safeHouse: {},
            },
            staff:null
        };
        
        this.tracking = null;

        this.isCreating = !this.budgetId && this.borderStationId >= 0;
        this.isViewing = $stateParams.isViewing === 'true';

        this.sectionTemplateUrl = null;
        this.safeHouseTotal = 0;
        this.total = 0;
        this.projectTotal = {};

        this.validRoute();

        if (this.isCreating) {
            this.newBudgetForm();
        } else {
            this.getBudgetForm();
        }
    }
    
    strToPennies(strValue) {
        let cents = 0;
        let dollars = 0;
        let pennies = 0;
        if (strValue) {
            let pos = strValue.indexOf(".");
            if (pos < 0) {
                dollars = parseInt(strValue);
            } else {
                dollars= parseInt(strValue.substring(0,pos));
                let decimalDigits = strValue.length - (pos+1);
                if (decimalDigits === 1) {
                    cents = parseInt(strValue.substring(pos+1));
                    cents *= 10;
                } else if (decimalDigits === 2) {
                    cents = parseInt(strValue.substring(pos+1));
                }
            }
            pennies = dollars * 100 + cents;
        }
        return pennies;
    }
    
    penniesToStr(pennies) {
        let dollars = Math.floor(pennies / 100);
        let cents = pennies - dollars * 100;
        let str = cents + '';
        if (cents < 10) {
            str = '0' + str;
        }
        str = dollars + '.' + str;
        return str;
    }

    getOtherCost(otherItems, project = null) {
        let amount = 0;
        for (let i in otherItems) {
            if (project === null || project === otherItems[i].work_project) {
                amount += this.strToPennies(otherItems[i].cost);
            }
        }
        return amount;
    }

    removeItem(otherArray, idx) {
        let item = otherArray[idx];
        if (item.id) {
            this.deletedItems.push(item);
        }
        otherArray.splice(idx, 1);
        this.scope.budgetForm.$setDirty();
    }

    validAmount(amount) {
        if (amount) {
            return amount;
        }
        return 0;
    }

    validRoute() {
        if (!this.budgetId && !this.isCreating && !this.isViewing) {
            this.$state.go('budgetList');
        }
    }
    
    formatSection(section) {
    	let result = section.replace(/_/g, ' ');
        result = result.replace(/\b\w/g, first => first.toLocaleUpperCase());
        if (result === 'Money Not Spent To Deduct') {
            result = 'Money Not Spent (To Deduct)';
        }
    	return result;
    }

    // REGION: Administration
    stationeryTotal() {
        return (
            this.validAmount(this.form.number_of_intercepts_last_month) *
                this.strToPennies(this.form.number_of_intercepts_last_month_multiplier) +
                this.strToPennies(this.form.number_of_intercepts_last_month_adder)
        );
    }
    
    stationeryTotalDisplay() {
        return this.penniesToStr(this.stationeryTotal());
    }

    meetingsTotal() {
        return this.validAmount(this.form.number_of_meetings_per_month) * this.strToPennies(this.form.number_of_meetings_per_month_multiplier);
    }
    
    meetingsTotalDisplay() {
        return this.penniesToStr(this.meetingsTotal());
    }

    boothTotal() {
        var amount = 0;
        if (this.form.booth) {
            amount += this.strToPennies(this.form.booth_amount);
        }
        
        return amount;
    }
    
    boothTotalDisplay() {
        return this.penniesToStr(this.boothTotal());
    }
    
    officeTotal() {
        var amount = 0;
        if (this.form.office) {
            amount += this.strToPennies(this.form.office_amount);
        }
        
        return amount;
    }
    
    officeTotalDisplay() {
        return this.penniesToStr(this.officeTotal());
    }

    adminTotal() {
        let amount = this.meetingsTotal() + this.getOtherCost(this.form.other.Administration);
        if (this.form.communication_chair) {
            amount += this.strToPennies(this.form.communication_chair_amount);
        }
        if (this.form.travel_chair) {
            amount += this.strToPennies(this.form.travel_chair_amount);
        }
        this.form.totals.borderMonitoringStation.administration = this.penniesToStr(amount);
        return amount;
    }
    
    adminTotalDisplay() {
        this.adminTotal();
        return this.form.totals.borderMonitoringStation.administration;
    }
    // ENDREGION: Administration

    // REGION: Awareness
    awarenessTotal() {
        var amount = 0;
        if (this.form.contact_cards) {
            amount += this.strToPennies(this.form.contact_cards_amount);
        }
        if (this.form.awareness_party_boolean) {
            amount += this.strToPennies(this.form.awareness_party);
        }
        amount += this.stationeryTotal() + this.getOtherCost(this.form.other.Awareness);
        this.form.totals.borderMonitoringStation.supplies_and_Awareness = this.penniesToStr(amount);
        return amount;
    }
    
    awarenessTotalDisplay() {
        return this.penniesToStr(this.awarenessTotal());
    }
    // ENDREGION: Awareness

    // REGION: Food And Gas
    foodGasInterceptedGirls() {
        return this.validAmount(
            this.strToPennies(this.form.food_per_pv_amount) *
                this.form.number_of_intercepted_pvs *
                this.form.number_of_pv_days
        );
    }
    
    foodGasInterceptedGirlsDisplay() {
        return this.penniesToStr(this.foodGasInterceptedGirls());
    }

    foodGasLimboGirls() {
    	this.form.totals.limboOtherCost = this.getOtherCost(this.form.other.Limbo)/100;
        let amount = this.validAmount(this.strToPennies(this.form.limbo_girls_multiplier) * this.form.totals.limboOtherCost);
        return amount;
    }
    
    foodGasLimboGirlsDisplay() {
        return this.penniesToStr(this.foodGasLimboGirls());
    }
    // ENDREGION: Food And Gas
    
    impactMultiplyingTotal(project) {
	    if (this.impactMultiplying) {
	        let amount = this.getOtherCost(this.form.other.ImpactMultiplying, project);
	        this.form.totals.borderMonitoringStation.impactMultiplying = this.penniesToStr(amount);
	        return amount;
        }
    }
    
    impactMultiplyingTotalDisplay(project) {
    	if (this.impactMultiplying) {
	        this.impactMultiplyingTotal(project);
	        return this.form.totals.borderMonitoringStation.impactMultiplying;
        } else {
        	return null;
        }
    }
    
    pastMonthMoneySentTotal(project) {
        let amount = this.getOtherCost(this.form.other.PastMonth, project); 
        return this.penniesToStr(amount);
    }
    
    staffItemsTotal() {
    	if (!this.form.staff || !this.impactMultiplying) {
    		return;
    	}
    	
    	this.staffItemsTotalForProject(this.borderStationId);
    	this.impactMultiplying.forEach(multiplying => {
    	    this.staffItemsTotalForProject(multiplying.id);
    	});
    }
    
    staffItemsTotalForProject(project) {
        if (!this.form.staff.byProject[project] || this.form.staff.salaryProjects.indexOf(project) < 0) {
            return;
        }
        
        this.form.staff.itemTypes.forEach(itemType => {
            let total = 0;
            this.form.staff.byProject[project].sortedStaff.forEach(staffKey => {
                let staffEntry = this.form.staff[staffKey];
                let cost = this.strToPennies(staffEntry.items[itemType].cost);
                if (!Number.isNaN(cost)) {
                    total += Number(cost);
                }
            });
            this.form.staff.Total[project].items[itemType] = {cost:this.penniesToStr(total)};
        });
    }

    // REGION: Salaries
    salariesAndBenefitsTotal(project=null) {
        let amount = 0;
        this.staffItemsTotal();
        if (!this.form.staff || !this.impactMultiplying) {
            return 0;
        }
        
        this.form.totals.borderMonitoringStation.salaries_And_Benefits = {};
        
        let tmp = this.salariesAndBenefitsTotalByProject(this.borderStationId);
        if (project === this.borderStationId) {
            amount = tmp;
        }
        this.impactMultiplying.forEach(multiplying => {
            tmp = this.salariesAndBenefitsTotalByProject(multiplying.id);
            if (project === multiplying.id) {
                amount = tmp;
            }
        });
       
        return amount;
    }
    
    salariesAndBenefitsTotalByProject(project) {
        var amount = 0;
        if (!this.form.staff || this.form.staff.salaryProjects.indexOf(project) < 0) {
            return 0;
        }
        
        if (this.form.staff && this.form.staff.itemTypes) {
            this.form.staff.itemTypes.forEach(itemType => {
                if (itemType === 'Deductions') {
                    amount -= this.strToPennies(this.form.staff.Total[project].items[itemType].cost);
                } else if (itemType !== 'Travel') {
                    amount += this.strToPennies(this.form.staff.Total[project].items[itemType].cost);
                }
            });
        }
        
        amount += this.getOtherCost(this.form.other.Salaries, project);

		if (!this.form.totals.borderMonitoringStation.salaries_And_Benefits) {
			this.form.totals.borderMonitoringStation.salaries_And_Benefits = {};
		}
        this.form.totals.borderMonitoringStation.salaries_And_Benefits[project] = this.penniesToStr(amount);

        return amount;
    }
    // ENDREGION: Salaries
    
    rentAndUtilitiesTotal() {
        let amount = 0;
        amount = this.boothTotal() + this.officeTotal() + this.getOtherCost(this.form.other.RentUtilities);
        this.form.totals.borderMonitoringStation.rent_and_utilities = this.penniesToStr(amount);
        return amount;
    }
    
    rentAndUtilitiesTotalDisplay() {
        return this.penniesToStr(this.rentAndUtilitiesTotal());
    }

    // REGION: Shelter
    shelterUtilTotal() {
    	let total = 0;
    	if (this.form.shelter_rent) {
    		total += this.strToPennies(this.form.shelter_rent_amount);
    	}
    	if (this.form.shelter_water) {
    		total += this.strToPennies(this.form.shelter_water_amount);
    	}
    	if (this.form.shelter_electricity) {
    		total += this.strToPennies(this.form.shelter_electricity_amount);
    	}
        return total;
    }
    
    shelterUtilTotalDisplay() {
        return this.penniesToStr(this.shelterUtilTotal());
    }
    
    potentialVictimCareTotal() {
    	let amount = 0;
    	amount += this.shelterUtilTotal();
    	amount += this.foodGasInterceptedGirls();
    	amount += this.getOtherCost(this.form.other.PotentialVictimCare);
    	this.form.totals.borderMonitoringStation.Potential_Victim_Care = this.penniesToStr(amount);
    	
    	return amount;
    }
    
    potentialVictimCareTotalDisplay() {
        return this.form.totals.borderMonitoringStation.Potential_Victim_Care;
    }
    // ENDREGION: Shelter

    // REGION: Travel
    travelTotal() {
    	this.staffItemsTotal();
        var amount = 0;
        
        if (this.form.staff) {
        	 amount += this.strToPennies(this.form.staff.Total[this.borderStationId].items.Travel.cost);
        }
        amount += this.getOtherCost(this.form.other.Travel);
        this.form.totals.borderMonitoringStation.staff_travel = this.penniesToStr(amount);
        return amount;
    }
    
    travelTotalDisplay() {
        this.travelTotal();
        return this.form.totals.borderMonitoringStation.staff_travel;
    }
    // ENDREGION: Travel
    
    deductedNotSpentTotal(project) {
        if (project == null) {
            return;
        }
        let deductAmount = 0;
        let notDeductAmount = 0;
        for (let idx in this.form.other.MoneyNotSpent) {
            if (this.form.other.MoneyNotSpent[idx].cost && this.form.other.MoneyNotSpent[idx].work_project === project) {
                if (this.form.other.MoneyNotSpent[idx].deduct === 'Yes') {
                    deductAmount += this.form.other.MoneyNotSpent[idx].cost * 100;
                } else {
                    notDeductAmount += this.form.other.MoneyNotSpent[idx].cost * 100;
                }
            }
        }
        if (!this.totals) {
            this.totals = {};
        }
        if (!this.totals.notDeductableNotSpent) {
            this.totals.notDeductableNotSpent = {};
        }
        if (!this.totals.MoneyNotSpentTotal) {
            this.totals.MoneyNotSpentTotal = {};
        }
        this.totals.notDeductableNotSpent[project] = this.penniesToStr(notDeductAmount);
        this.totals.MoneyNotSpentTotal[project] = this.penniesToStr(deductAmount + notDeductAmount);
        if (project === null || project == this.borderStationId) {
            this.form.totals.borderMonitoringStation.Money_Not_Spent_To_Deduct = this.penniesToStr(deductAmount);
        }
        return deductAmount;
    }
    
    deductedNotSpentTotalDisplay(project) {
        return this.penniesToStr(this.deductedNotSpentTotal(project));
    }
    
    notDeductedNotSpentTotalDisplay(project) {
        this.deductedNotSpentTotal(project);
        return this.totals.notDeductableNotSpent[project];
    }
    
    notSpentTotalDisplay(project) {
        this.deductedNotSpentTotal(project);
        return this.totals.MoneyNotSpentTotal;
    }
    

    // REGION: Functions that handle totals
    setBorderMonitoringStationTotals(project) {
        let amount = (this.salariesAndBenefitsTotal(project) + this.rentAndUtilitiesTotal() + this.adminTotal() + 
                this.awarenessTotal() + this.travelTotal() + this.potentialVictimCareTotal() - this.deductedNotSpentTotal(project));
        this.borderMonitoringStationTotal = this.penniesToStr(amount);
        return amount;
    }
    
    setProjectTotal(project) {
        let amount = this.salariesAndBenefitsTotalByProject(project);
        if (project === this.borderStationId) {
            amount += (this.rentAndUtilitiesTotal() + this.adminTotal() + 
                    this.awarenessTotal() + this.travelTotal() + this.potentialVictimCareTotal() - this.deductedNotSpentTotal(project));
        } else {
            amount += this.impactMultiplyingTotal(project);
        }
        this.projectTotal[project] = this.penniesToStr(amount);
        return amount;
    }
    
    displayProjectTotal(project = null) {
        let useProject = project;
        if (useProject === null) {
            if (this.borderStationId === undefined) {
                return null;
            }
            useProject = this.borderStationId;
        }
        this.setProjectTotal(useProject);
        return this.projectTotal[useProject];
    }

    setTotals() {
        let amount = this.setBorderMonitoringStationTotals(self.borderStationId);
        this.total = this.penniesToStr(amount);
    }
    
    displayTotal(project) {
        this.setTotals(project);
        return this.total;
    }
    // ENDREGION: Functions that handle totals

    // REGION: Call to Service Functions
    // REGION: DELETE Calls
    deleteOtherItems() {
        for (let i in this.deletedItems) {
            this.service.deleteOtherItem(this.budgetId, this.deletedItems[i]);
        }
    }
    // ENDREGION: DELETE Calls
    
    deleteStaffItems() {
        for (let i in this.form.staff.deleteStaffItems) {
            this.service.deleteStaffItem(this.budgetId, this.form.staff.deleteStaffItems[i]);
        }
    }
    
    deleteNotSpentItems() {
        for (let i in this.deletedNotSpentItems) {
            this.service.deleteNotSpentItem(this.budgetId, this.deletedNotSpentItems[i]);
        }
    }

    // REGION: GET Calls
    getAllData() {
        this.getStaff();
        this.getOtherData();
        this.setTotals();
        this.getBorderStation();
    }

    getBorderStation() {
        this.service.getBorderStation(this.borderStationId).then(responseStation => {
            this.mainProject = responseStation.data;
            this.form.station_name = responseStation.data.station_name;
            this.currency = decodeURI(responseStation.data.country_currency);
            this.service.getCountry(responseStation.data.operating_country).then(response => {
                this.countryId = response.data.id;
                this.countryName = response.data.name;
                this.getImpactMultiplyingProjects(responseStation.data);
                let options = response.data.options;
                if (options && 'pastMonthSent' in options && options.pastMonthSent) {
                    this.sections.allSections.push({ name: 'Past Month Sent Money', templateUrl: pastMonth, value: Constants.FormSections.PastMonth });
                }
                this.sections.allSections.push({ name: 'Money Not Spent', templateUrl: moneyNotSpentForm, value: 9999 });
            });
        });
    }
    
    getImpactMultiplyingProjects(mainProject) {
        this.service.getProjects(this.countryId).then(response => {
            this.impactMultiplying = [];
            this.allProjects = [mainProject];
            for (let projectIdx in response.data) {
                if (response.data[projectIdx].mdf_project === mainProject.id) {
                    this.impactMultiplying.push(response.data[projectIdx]);
                    this.allProjects.push(response.data[projectIdx]);
                }
            }
            this.fillMissingStaffItems();
            this.setTotals();
            if (this.impactMultiplying.length === 0) {
                for (let idx=0; idx < this.sections.allSections.length; idx++) {
                    if (this.sections.allSections[idx].name === 'Impact Multiplying') {
                        this.sections.allSections.splice(idx, 1);
                    }
                }
            }
        });
    }

    newBudgetForm() {
        this.service.getFormForMonthYear(this.borderStationId, this.month, this.year).then(response => {
            this.getBorderStation();

            this.form = response.data.form;
            this.form.id = null;
            this.form.totals = {
                borderMonitoringStation: {},
                other: {},
                safeHouse: {},
            };
            this.form.month_year = moment()
                .year(this.year)
                .month(this.month - 1)
                .date(15);
            this.form.previousData = response.data.top_table_data;
            this.form.number_of_intercepted_pvs = this.form.previousData.last_month;
            this.form.number_of_intercepts_last_month = this.form.previousData.last_month
            this.form.staffItems = [];
            response.data.staff_items.forEach(item => {
                let newItem = JSON.parse(JSON.stringify(item));
                newItem.id = null;
                if (item.type_name === 'Salary' || item.type_name === 'Deductions' || item.type_name.indexOf('~') >= 0) {
                    this.form.staffItems.push(newItem);
                } else {
                    // don't keep cost or description
                    newItem.cost = null;
                    newItem.description = '';
                    this.form.staffItems.push(newItem);
                }
            });

            response.data.other_items.forEach(item => {
                item.id = null;
                item.budget_item_parent = null;
            });

            this.form.other = [];

            // Don't set PastMonth to last month's values (they are one time expenses)
            for (let key in Constants.FormSections) {
                if (['PastMonth'].indexOf(key) === -1) {
                    this.setOtherItemsForSection(key, response.data.other_items, true);
                } else {
                    this.form.other[key] = [];
                }
            }
            
            this.form.past_sent_approved = '';

            this.getStaff();

            this.setTotals();
        });
    }

    getBudgetForm() {
        this.service
            .getBudgetForm(this.budgetId)
            .then(response => {
                this.form = response.data;
                this.month = parseInt(window.moment(this.form.month_year).format('M'));
                this.year = parseInt(window.moment(this.form.month_year).format('YYYY'));
                this.borderStationId = response.data.border_station;
                this.form.totals = {
                    borderMonitoringStation: {},
                    other: {},
                    safeHouse: {},
                };
                this.getAllData();
            })
            .then(() => {
                this.service.getTopTableData(this.form.id).then(response => {
                    this.form.previousData = response.data;
                });
            });
    }

    getAllOtherItems() {
        return this.service.getOtherItems(this.budgetId).then(response => {
            this.otherItems = response.data;
            this.setTotals();
        });
    }

    getOtherData() {
        this.form.other = {};
        if (this.utils.validId(this.budgetId)) {
            this.getAllOtherItems().then(() => {
                for (let key in Constants.FormSections) {
                    this.setOtherItemsForSection(key, this.otherItems);
                }
            });
        } else {
            for (let key in Constants.FormSections) {
                this.form.other[key] = [];
            }
        }
    }

    setOtherItemsForSection(key, items, newMdf=false) {
        this.form.other[key] = items.filter(item => {
            if (key === 'MoneyNotSpent' && newMdf) {
                return item.form_section === Constants.FormSections[key] && item.deduct === 'No';
            } else {
                return item.form_section === Constants.FormSections[key];
            }
        });
        if (key === 'Limbo') {
            for (let idx=0; idx < this.form.other.Limbo.length; idx++) {
                let pos = this.form.other.Limbo[idx].cost.indexOf(".");
                if (pos >= 0) {
                    this.form.other.Limbo[idx].cost = this.form.other.Limbo[idx].cost.substring(0,pos);
                }
            }
        }
        for (let idx=0; idx < this.form.other[key].length; idx++) {
            if (this.form.other[key][idx].associated_section) {
                this.form.other[key][idx].associated_string = '' + this.form.other[key][idx].associated_section;
            }
        }
    }

    getStaff() {
        // On create: get current staff and map those onto old staff salaries
        if (this.isCreating) {
            return this.service.getStaff(this.borderStationId).then(response => {
                let staffList = response.data.results;
                this.mapNewStaffItems(staffList, this.form.staffItems);
                this.setTotals();
            });
        }
        // On edit: get staff salaries connected to old sheet and extract staff from there
        else {
            return this.service.getStaffItems(this.budgetId).then(response => {
                this.form.staffItems = response.data;
                this.extractStaffFromStaffItems(this.form.staffItems);
                this.setTotals();
            });
        }
    }

    extractStaffFromStaffItems(staffItems) {
        let staff = {
    		itemTypes:['Salary', 'Deductions', 'Travel'],
    		items:[],
    		deleteStaffItems:[],
    		salaryProjects: [this.borderStationId],
    		byProject: {},
    		Total: {},
    	};
        staff.byProject[this.borderStationId] = {sortedStaff:[]};
    	
        staffItems.forEach(staffItem => {
            let workProject = staffItem.work_project;
            if (staff.salaryProjects.indexOf(workProject) < 0) {
                staff.salaryProjects.push(workProject);
                staff.byProject[workProject] = {sortedStaff:[]};
            }
            let staffKey = staffItem.staff_person.toString() + ':' + workProject;
            if (staff.byProject[workProject].sortedStaff.indexOf(staffKey) < 0) {
                staff.byProject[workProject].sortedStaff.push(staffKey);
                staff.Total[workProject] = { items:{} };
            }
            if (!staff.hasOwnProperty(staffKey)) {
                staff[staffKey] = {
                    id:staffItem.staff_person,
                    first_name:staffItem.staff_first_name,
                    last_name:staffItem.staff_last_name,
                    name:staffItem.staff_first_name + ' ' + staffItem.staff_last_name,
                    position:staffItem.position,
                    items:{}
                };
            }
        
            staff[staffKey].items[staffItem.type_name] = staffItem;
            if (staff.itemTypes.indexOf(staffItem.type_name) === -1) {
                staff.itemTypes.push(staffItem.type_name);
            }
            staff.byProject[workProject].sortedStaff = staff.byProject[workProject].sortedStaff.sort((a, b) => {
                        if (staff[a].name > staff[b].name) {
                            return 1;
                         } else {
                             return -1;}});
        });
        
        staff.itemTypes.forEach(itemType => {
        	staff.salaryProjects.forEach(project => {
        		staff.Total[project].items[itemType] = {cost:null};
        	});
        });
        
        
        this.fillMissingStaffItems(staff);
        this.form.staff = staff;
    }

    mapNewStaffItems(staffList, staffItems) {
    	let staff = {
    		itemTypes:['Salary', 'Deductions', 'Travel'],
    		items:[],
    		deleteStaffItems:[],
    		salaryProjects: [],
    		byProject: {},
    		Total: {},
    	};
    	
    	staffList.forEach(staffEntry => {
    	    staffEntry.works_on.forEach(worksOn => {
    	        let workProject = worksOn.works_on.project_id;
    	        let staffKey = staffEntry.id + ':' + workProject;
    	        if (staff.salaryProjects.indexOf(workProject) < 0) {
                    staff.salaryProjects.push(workProject);
                    staff.byProject[workProject] = {sortedStaff:[]};
                    staff.Total[workProject] = { items:{} };
                }
    	        if (staff.byProject[workProject].sortedStaff.indexOf(staffKey) < 0) {
                    staff.byProject[workProject].sortedStaff.push(staffKey);
                }
    	        if (!staff.hasOwnProperty(staffKey)) {
                    staff[staffKey] = {
                    	id:staffEntry.id,
                        first_name:staffEntry.first_name,
                        last_name:staffEntry.last_name,
                        name:staffEntry.first_name + ' ' + staffEntry.last_name,
                        position:staffEntry.position,
                        items:{}
                    };
                }
    	        staff.byProject[workProject].sortedStaff = staff.byProject[workProject].sortedStaff.sort((a, b) => {
                    if (staff[a].name > staff[b].name) {
                        return 1;
                     } else {
                         return -1;}});
    	    });
    	});
    	
    	
    	
    	staffItems.forEach(staffItem => {
            let workProject = staffItem.work_project;
            if (staff.salaryProjects.indexOf(workProject) < 0) {
                return;
            }
            let staffKey = staffItem.staff_person.toString() + ':' + workProject;
            if (staff.byProject[workProject].sortedStaff.indexOf(staffKey) < 0) {
                return;
            }
            if (!staff.hasOwnProperty(staffKey)) {
                return;
            }
        
            staff[staffKey].items[staffItem.type_name] = staffItem;
            if (staff.itemTypes.indexOf(staffItem.type_name) === -1) {
                staff.itemTypes.push(staffItem.type_name);
            }
        });
        
        staff.itemTypes.forEach(itemType => {
        	staff.salaryProjects.forEach(project => {
        		staff.Total[project].items[itemType] = {cost:null};
        	});
        });
        
        this.fillMissingStaffItems(staff);
        this.form.staff = staff;
    }
    
    fillMissingStaffItems(staff) {
        if (!staff) {
            return;
        }
        
        staff.salaryProjects.forEach(project => {
            this.fillMissingStaffItemsForProject(staff, project);
        });
    }
    
    fillMissingStaffItemsForProject(staff, project) {
        if (!staff.byProject[project]) {
            return;
        }
        staff.byProject[project].sortedStaff.forEach(staffKey => {
            staff.itemTypes.forEach(itemType => {
                let theStaff = staff[staffKey];
                if (!theStaff.items.hasOwnProperty(itemType)) {
                    let staffItem = {
                        id: null,
                        staff_person: theStaff.id,
                        staff_first_name: theStaff.first_name,
                        staff_last_name: theStaff.last_name,
                        position: theStaff.position,
                        type_name: itemType,
                        description: '',
                        cost: null,
                        work_project: project,
                    };
                    this.form.staffItems.push(staffItem);
                    theStaff.items[itemType] = staffItem;
                }
            });
        });
    }
    
    enterDetail(staffKey, categoryType) {
    	this.modalActions = {
    		detail: this.form.staff[staffKey].items[categoryType].description
    	};
	    this.$uibModal.open({
	        bindToController: true,
	        controller: DetailModalController,
	        controllerAs: 'vm',
	        resolve: {
	            modalActions: () => this.modalActions,
	        },
	        size: 'lg',
	        templateUrl: detailTemplate,
	    }).result.then(() => {
	    	this.modified = true;
	        this.form.staff[staffKey].items[categoryType].description = this.modalActions.detail;
	    });
    }
    
    addCategory() {
	    this.modalActions = {};
	    this.$uibModal.open({
	        bindToController: true,
	        controller: CategoryModalController,
	        controllerAs: 'vm',
	        resolve: {
	            modalActions: () => this.modalActions,
	        },
	        size: 'md',
	        templateUrl: categoryTemplate,
	    }).result.then(() => {
	        if (!this.modalActions.categoryName) {
	           return;
	        }
	        this.modified = true;
	        let newName = this.modalActions.categoryName;
	        if (this.modalActions.copyData === 'Yes') {
	            newName += '~';
	        }
	        this.addItemType(newName);
	    });
    }
    
    addItemType(typeName) {
    	if (this.form.staff.itemTypes.hasOwnProperty(typeName)) {
    		return;
    	}
    	
    	this.form.staff.itemTypes.push(typeName);
    	this.form.staff.salaryProjects.forEach(project => {
    	    this.form.staff.Total[project].items[typeName] = {cost:null};
    	});
    	this.fillMissingStaffItems(this.form.staff);
    	this.staffItemsTotalForProject();
    }
    
    removeItemType(typeName) {
    	if (!window.confirm("Confirm that you want to remove the category '" + typeName + "'")) {
            return;
        }
    	if (this.form.staff.itemTypes.indexOf(typeName) === -1) {
    		return;
    	}
    	this.modified = true;
    	this.form.staff.itemTypes.splice(this.form.staff.itemTypes.indexOf(typeName),1);
    	this.form.staffItems = this.form.staffItems.filter(item => item.type_name !== typeName);
    	
    	this.form.staff.salaryProjects.forEach(project => {
    	    this.form.staff.byProject[project].sortedStaff.forEach (staffKey => {
    	        let staffEntry = this.form.staff[staffKey];
    	        if (staffEntry.items.hasOwnProperty(typeName)) {
                    if (staffEntry.items[typeName].id) {
                        this.form.staff.deleteStaffItems.push(staffEntry.items[typeName]);
                    }
                    delete staffEntry.items[typeName];
                }
    	    });
    	});
    	this.scope.budgetForm.$setDirty();
    }

    // ENDREGION: GET Calls

    // REGION: PUT Calls
    updateOrCreateAll() {
        this.updateOrCreateStaffItems();
        this.updateOrCreateOtherItems();
        this.deleteStaffItems();
        this.deleteOtherItems();
    }
    
    startRequest() {
        this.tracking.startRequest();
    }
    
    completeRequest(isError=false) {
        if (this.tracking) {
            this.tracking.completeRequest(isError);
            if (this.tracking.allRequestsCompleted()) {
                if (this.tracking.hasErrors()) {
                    this.tracking = null;
                } else {
                    if (this.tracking.shouldFinalize()) {
                        let now = new Date();
                        this.form.date_finalized = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
                        this.service.finalize(this.budgetId, this.form);
                    }
                    
                    this.toastr.success(`${this.form.station_name} Budget Form Updated Successfully!`);
                    this.tracking = null;
                    this.$state.go('budgetList'); 
                }
            }
        }
    }
    
    finalizeForm() {
        if (this.confirmedFinalize){
            this.updateOrCreateForm(true);
        }
        else {
            this.confirmedFinalize = true;
        }
    }

    updateOrCreateForm(finalize = false) {
        this.tracking = new Tracking(finalize);
        this.startRequest();
        if (this.isCreating) {
            this.startRequest();
            this.service.createForm(this.form).then(
                response => {
                    this.budgetId = response.data.id;
                    this.updateOrCreateAll();
                    this.completeRequest();
                },
                error => {
                    this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
                    this.completeRequest(true);
                }
            );
        } else {
            this.startRequest();
            this.service.updateForm(this.budgetId, this.form).then(() => {
                this.completeRequest();
            },
            error => {
                this.toastr.error(`There was an error updating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
                this.completeRequest(true);
            });
            this.updateOrCreateAll();
        }
        this.completeRequest();
    }

    updateOtherItem(item) {
        this.startRequest();
        this.service.updateOtherItem(this.budgetId, item).then(() => {
            this.completeRequest();
        },
        error => {
            this.toastr.error(`There was an error updating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
            this.completeRequest(true);
        });
    }

    createOtherItem(item) {
        this.startRequest();
        this.service.createOtherItem(this.budgetId, item).then(() => {
            this.completeRequest();
        },
        error => {
            this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
            this.completeRequest(true);
        });
    }

    updateOrCreateOtherItems() {
        for (let section in this.form.other) {
            for (let i in this.form.other[section]) {
                let item = this.form.other[section][i];
                if (item.associated_string) {
                    let num = parseInt(item.associated_string);
                    if (!Number.isNaN(num)) {
                        item.associated_section = num;
                    }
                }
                if (item.id) {
                    this.updateOtherItem(item);
                } else {
                    item.budget_item_parent = this.budgetId;
                    item.form_section = Constants.FormSections[section];
                    this.createOtherItem(item);
                }
            }
        }
    }

    updateOrCreateStaffItems() {
        this.form.staff.salaryProjects.forEach(project => {
            this.form.staff.byProject[project].sortedStaff.forEach (staffKey => {
                this.form.staff.itemTypes.forEach(itemType => {
                    let staffItem = this.form.staff[staffKey].items[itemType];
                    staffItem.budget_calc_sheet = this.budgetId;
                    if (staffItem.cost === '') {
                        staffItem.cost = null;
                    }
                    this.startRequest();
                    if (staffItem.id) {
                        this.service.updateStaffItem(this.budgetId, staffItem).then(() => {
                            this.completeRequest();
                        },
                        error => {
                            this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
                            this.completeRequest(true);
                        });
                    } else {
                        this.service.createStaffItem(staffItem).then(() => {
                            this.completeRequest();
                        },
                        error => {
                            this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
                            this.completeRequest(true);
                        });
                    }
                });
            });
        });
    }

    // ENDREGION: PUT Calls
    // ENDREGION: Call to Service Functions

    clearValue(value) {
        let returnValue;
        if (typeof value === 'boolean') {
            returnValue = false;
        } else if (typeof value === 'number') {
            returnValue = 0;
        } else {
            returnValue = value;
        }
        return returnValue;
    }

    clearValues() {
        for (let key in this.form) {
            if (key !== 'border_station' || key !== 'id') {
                this.form[key] = this.clearValue(this.form[key]);
            }
        }

        for (let index in this.form.staff) {
            this.form.staff[index].salaryInfo.salary = this.clearValue(this.form.staff[index].salaryInfo.salary);
        }
        this.setTotals();
    }

    getMonthName() {
        return this.months.filter(month => {
            return month.value === this.month;
        })[0].name;
    }
    
    projectName(projectId) {
        let name = 'Unnown';
        if (projectId === this.borderStationId) {
            name = this.form.station_name;
        } else {
            for (let idx in this.impactMultiplying) {
                if (this.impactMultiplying[idx].id === projectId) {
                    name = this.impactMultiplying[idx].station_name;
                }
            }
        }
        return name;
    }
    
    findProject(projectId) {
        let project = null;
        if (projectId === this.borderStationId) {
            project = this.mainProject;
        } else {
            for (let idx in this.impactMultiplying) {
                if (this.impactMultiplying[idx].id === projectId) {
                    project = this.impactMultiplying[idx];
                }
            }
        }
        return project;
    }
    
    filterCategoryTypeName (name) {
        return name.replace('~','');
    }
}
