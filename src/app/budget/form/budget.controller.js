import Constants from './constants.js';

import salariesForm from './components/salaries/salariesForm.html';
import communicationForm from './components/communication/communicationForm.html';
import travelForm from './components/travel/travelForm.html';
import administrationForm from './components/administration/administrationForm.html';
import miscellaneousForm from './components/miscellaneous/miscellaneousForm.html';
import potentialVictimCareForm from './components/potentialVictimCare/potentialVictimCareForm.html';
import awarenessForm from './components/awareness/awarenessForm.html';
import pastMonth from './components/pastMonth/pastMonthSentMoneyForm.html';
import moneyNotSpentForm from './components/moneyNotSpent/moneyNotSpent.html';

import categoryTemplate from './components/salaries/category.html';
import detailTemplate from './detail.html';

import CategoryModalController from './components/salaries/categoryModal.controller';
import DetailModalController from './detailModal.controller';


export default class BudgetController {
    constructor($state, $stateParams,  $uibModal, BudgetService, UtilService, toastr) {
        'ngInject';

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$uibModal = $uibModal;
        this.service = BudgetService;
        this.utils = UtilService;
        this.toastr = toastr;
        this.currency = '';
        this.modified = false;

        this.sections = {
            allSections: [
                { name: 'Salaries & Benefits', templateUrl: salariesForm, value: Constants.FormSections.Salaries },
                { name: 'Communication', templateUrl: communicationForm, value: Constants.FormSections.Communication },
                { name: 'Travel', templateUrl: travelForm, value: Constants.FormSections.Travel },
                { name: 'Administration', templateUrl: administrationForm, value: Constants.FormSections.Administration },
                { name: 'Potential Victim Care', templateUrl: potentialVictimCareForm, value: Constants.FormSections.Potential_Victim_Care },
                { name: 'Awareness', templateUrl: awarenessForm, value: Constants.FormSections.Awareness },
                { name: 'Miscellaneous', templateUrl: miscellaneousForm, value: Constants.FormSections.Miscellaneous }
            ],
            excludeFromDropDown: [
                'Past Month Sent Money',
                'Money Not Spent',
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
        this.borderStationId = $stateParams.borderStationId;

        this.month = parseInt(window.moment().format('M'));
        this.year = parseInt(window.moment().format('YYYY'));

        this.deletedItems = [];
        this.form = {
            other: {},
            totals: {
                borderMonitoringStation: {},
                other: {},
                safeHouse: {},
            },
        };

        this.isCreating = !this.budgetId && this.borderStationId;
        this.isViewing = $stateParams.isViewing === 'true';

        this.sectionTemplateUrl = null;
        this.safeHouseTotal = 0;
        this.total = 0;

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

    getOtherCost(otherItems) {
        let amount = 0;
        for (let i in otherItems) {
            amount += this.strToPennies(otherItems[i].cost);
        }
        return amount;
    }

    removeItem(otherArray, idx) {
        let item = otherArray[idx];
        if (item.id) {
            this.deletedItems.push(item);
        }
        otherArray.splice(idx, 1);
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
    adminStationaryTotal() {
        return (
            this.validAmount(this.form.administration_number_of_intercepts_last_month) *
                this.strToPennies(this.form.administration_number_of_intercepts_last_month_multiplier) +
                this.strToPennies(this.form.administration_number_of_intercepts_last_month_adder)
        );
    }
    
    adminStationaryTotalDisplay() {
        return this.penniesToStr(this.adminStationaryTotal());
    }

    adminMeetingsTotal() {
        return this.validAmount(this.form.administration_number_of_meetings_per_month) * this.strToPennies(this.form.administration_number_of_meetings_per_month_multiplier);
    }
    
    adminMeetingsTotalDisplay() {
        return this.penniesToStr(this.adminMeetingsTotal());
    }

    adminBoothRentalTotal() {
        var amount = 0;
        if (this.form.administration_booth) {
            amount += this.strToPennies(this.form.administration_booth_amount);
        }
        if (this.form.administration_office) {
            amount += this.strToPennies(this.form.administration_office_amount);
        }
        return amount;
    }
    
    adminBoothRentalTotalDisplay() {
        return this.penniesToStr(this.adminBoothRentalTotal());
    }

    adminTotal() {
        let amount = this.adminStationaryTotal() + this.adminMeetingsTotal() + this.adminBoothRentalTotal() + this.getOtherCost(this.form.other.Administration);
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
        if (this.form.awareness_contact_cards) {
            amount += this.strToPennies(this.form.awareness_contact_cards_amount);
        }
        if (this.form.awareness_awareness_party_boolean) {
            amount += this.strToPennies(this.form.awareness_awareness_party);
        }
        amount += this.getOtherCost(this.form.other.Awareness);
        this.form.totals.borderMonitoringStation.awareness = this.penniesToStr(amount);
        return amount;
    }
    
    awarenessTotalDisplay() {
        this.awarenessTotal();
        return this.form.totals.borderMonitoringStation.awareness;
    }
    // ENDREGION: Awareness

    // REGION: Communication
    communicationManagerTotal() {
        var amount = 0;

        if (this.form.communication_chair) {
            amount += this.strToPennies(this.form.communication_chair_amount);
        }
        return amount;
    }

    communicationTotal() {
    	this.staffItemsTotal();
        let amount = this.communicationManagerTotal();
        if (this.form.staff) {
          amount += this.strToPennies(this.form.staff.Total.items.Communication.cost);
        }
        amount += this.getOtherCost(this.form.other.Communication);
        this.form.totals.borderMonitoringStation.communication = this.penniesToStr(amount);
        return amount;
    }
    
    communicationTotalDisplay() {
        this.communicationTotal();
        return this.form.totals.borderMonitoringStation.communication;
    }
    // ENDREGION: Communication

    // REGION: Food And Gas
    foodGasInterceptedGirls() {
        return this.validAmount(
            this.strToPennies(this.form.food_and_gas_number_of_intercepted_girls_multiplier_before) *
                this.form.food_and_gas_number_of_intercepted_girls *
                this.form.food_and_gas_number_of_intercepted_girls_multiplier_after
        );
    }
    
    foodGasInterceptedGirlsDisplay() {
        return this.penniesToStr(this.foodGasInterceptedGirls());
    }

    foodGasLimboGirls() {
        return this.validAmount(parseInt(this.form.food_and_gas_limbo_girls_multiplier) * this.getOtherCost(this.form.other.Limbo)/100);
    }

    foodAndGasTotal() {
        let amount = this.foodGasInterceptedGirls() + this.foodGasLimboGirls();
        amount += this.getOtherCost(this.form.other.FoodAndGas);
        this.form.totals.safeHouse.foodAndGas = this.penniesToStr(amount);
        return amount;
    }
    // ENDREGION: Food And Gas

    // REGION: Medical
    medicalTotal() {
        let total = this.strToPennies(this.form.medical_last_months_expense) + this.getOtherCost(this.form.other.Medical);
        return total;
    }
    // ENDREGION: Medical

    // REGION: Miscellaneous
    miscellaneousTotal() {
        let amount = this.getOtherCost(this.form.other.Miscellaneous);
        this.form.totals.borderMonitoringStation.miscellaneous = this.penniesToStr(amount);
        return amount;
    }
    
    miscellaneousTotalDisplay() {
        this.miscellaneousTotal();
        return this.form.totals.borderMonitoringStation.miscellaneous;
    }
    // ENDREGION: Miscellaneous
    
    pastMonthMoneySentTotal() {
        let amount = this.getOtherCost(this.form.other.PastMonth); 
        return this.penniesToStr(amount);
    }
    
    staffItemsTotal() {
    	if (!this.form.staff || !this.form.staff.sortedStaff) {
    		return;
    	}
    	
    	this.form.staff.Total = {};
    	this.form.staff.Total.items = {};
    	
    	this.form.staff.itemTypes.forEach(itemType => {
    		let total = 0;
    		this.form.staff.sortedStaff.forEach(staff => {
    			let staffEntry = this.form.staff[staff.staffKey];
    			let cost = this.strToPennies(staffEntry.items[itemType].cost);
    			if (!Number.isNaN(cost)) {
    				total += Number(cost);
    			}
    		});
    		this.form.staff.Total.items[itemType] = {cost:this.penniesToStr(total)};
    	});
    }

    // REGION: Salaries
    salariesAndBenefitsTotal() {
        var amount = 0;
        
        this.staffItemsTotal();
        if (this.form.staff && this.form.staff.itemTypes) {
	        this.form.staff.itemTypes.forEach(itemType => {
	            if (itemType === 'Deductions') {
	                amount -= this.strToPennies(this.form.staff.Total.items[itemType].cost);
	            } else if (itemType !== 'Communication' && itemType !== 'Travel') {
	        		amount += this.strToPennies(this.form.staff.Total.items[itemType].cost);
	        	}
	        });
	    }
        
        amount += this.getOtherCost(this.form.other.Salaries);

        this.form.totals.borderMonitoringStation.salaries_And_Benefits = this.penniesToStr(amount);

        return amount;
    }
    // ENDREGION: Salaries

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
    	amount += this.foodAndGasTotal();
    	amount += this.getOtherCost(this.form.other.Shelter);
    	this.form.totals.borderMonitoringStation.potential_Victim_Care = this.penniesToStr(amount);
    	
    	return amount;
    }
    
    potentialVictimCareTotalDisplay() {
        return this.form.totals.borderMonitoringStation.potential_Victim_Care;
    }
    // ENDREGION: Shelter

    // REGION: Travel
    travelTotal() {
    	this.staffItemsTotal();
        var amount = 0;
        if (this.form.travel_chair_with_bike) {
            amount += this.strToPennies(this.form.travel_chair_with_bike_amount);
        }
        if (this.form.staff) {
        	 amount += this.strToPennies(this.form.staff.Total.items.Travel.cost);
        }
        amount += this.getOtherCost(this.form.other.Travel);
        this.form.totals.borderMonitoringStation.travel = this.penniesToStr(amount);
        return amount;
    }
    
    travelTotalDisplay() {
        this.travelTotal();
        return this.form.totals.borderMonitoringStation.travel;
    }
    // ENDREGION: Travel
    
    deductedNotSpentTotal() {
        let deductAmount = 0;
        let notDeductAmount = 0;
        for (let idx in this.form.other.MoneyNotSpent) {
            if (this.form.other.MoneyNotSpent[idx].cost) {
                if (this.form.other.MoneyNotSpent[idx].deduct === 'Yes') {
                    deductAmount += this.form.other.MoneyNotSpent[idx].cost * 100;
                } else {
                    notDeductAmount += this.form.other.MoneyNotSpent[idx].cost * 100;
                }
            }
        }
        this.form.totals.borderMonitoringStation.Money_Not_Spent_To_Deduct = this.penniesToStr(deductAmount);
        if (!this.totals) {
            this.totals = {};
        }
        this.totals.notDeductableNotSpent = this.penniesToStr(notDeductAmount);
        this.totals.MoneyNotSpentTotal = this.penniesToStr(deductAmount + notDeductAmount);
        return deductAmount;
    }
    
    deductedNotSpentTotalDisplay() {
        return this.penniesToStr(this.deductedNotSpentTotal());
    }
    
    notDeductedNotSpentTotalDisplay() {
        this.deductedNotSpentTotal();
        return this.totals.notDeductableNotSpent;
    }
    
    notSpentTotalDisplay() {
        this.deductedNotSpentTotal();
        return this.totals.MoneyNotSpentTotal;
    }
    

    // REGION: Functions that handle totals
    setBorderMonitoringStationTotals() {
        let amount = (this.salariesAndBenefitsTotal() + this.communicationTotal() + this.travelTotal() + this.adminTotal() + 
                this.potentialVictimCareTotal() + this.awarenessTotal() + this.miscellaneousTotal() - this.deductedNotSpentTotal());
        this.borderMonitoringStationTotal = this.penniesToStr(amount);
        return amount;
    }

    setTotals() {
        let amount = this.setBorderMonitoringStationTotals();
        this.total = this.penniesToStr(amount);
    }
    
    displayTotal() {
        this.setTotals();
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
        this.service.getBorderStation(this.borderStationId).then(response => {
            this.form.station_name = response.data.station_name;
            this.currency = decodeURI(response.data.country_currency);
            this.service.getCountry(response.data.operating_country).then(response => {
                let options = response.data.options;
                if ('pastMonthSent' in options && options.pastMonthSent) {
                    this.sections.allSections.push({ name: 'Past Month Sent Money', templateUrl: pastMonth, value: Constants.FormSections.PastMonth });
                }
                this.sections.allSections.push({ name: 'Money Not Spent', templateUrl: moneyNotSpentForm, value: 9999 });
            });
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
            this.form.staffItems = response.data.staff_items;

            response.data.other_items.forEach(item => {
                item.id = null;
                item.budget_item_parent = null;
            });

            this.form.other = [];

            // Don't set miscellaneous to last month's values (they are one time expenses)
            for (let key in Constants.FormSections) {
                if (['Miscellaneous'].indexOf(key) === -1) {
                    this.setOtherItemsForSection(key, response.data.other_items);
                } else {
                    this.form.other[key] = [];
                }
            }

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

    setOtherItemsForSection(key, items) {
        this.form.other[key] = items.filter(item => {
            return item.form_section === Constants.FormSections[key];
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
        this.form.staff = {
        	itemTypes:['Salary', 'Deductions', 'Communication', 'Travel'],
        	sortedStaff:[],
        	deleteStaffItems:[],
        };
        staffItems.forEach(staffItem => {
        	let staffKey = staffItem.staff_person.toString();
        	if (!this.form.staff.hasOwnProperty(staffKey)) {
        		this.form.staff[staffKey] = {
        			first_name:staffItem.staff_first_name,
        			last_name:staffItem.staff_last_name,
        			position:staffItem.position,
        			items:{}
        		};
        		this.form.staff.sortedStaff.push({staffKey:staffKey, name: staffItem.staff_first_name + ' ' + staffItem.staff_last_name});
        	}
        
        	this.form.staff[staffKey].items[staffItem.type_name] = staffItem;
        	if (this.form.staff.itemTypes.indexOf(staffItem.type_name) === -1) {
        		this.form.staff.itemTypes.push(staffItem.type_name);
        	}
        	this.form.staff.sortedStaff = this.form.staff.sortedStaff.sort((a, b) => {if (a.name > b.name) {return 1;} else {return -1;}});
        });
        this.fillMissingStaffItems();
    }

    mapNewStaffItems(staffList) {
    	let newStaffItems = [];
    	this.form.staff = {
        	itemTypes:['Salary', 'Communication', 'Travel'],
        	sortedStaff:[],
        	deleteStaffItems:[],
        };
        
        staffList.forEach(staff => {
        	let staffKey = staff.id.toString();
        	this.form.staff[staffKey] = {
        		first_name:staff.first_name,
    			last_name:staff.last_name,
    			position:staff.position,
    			items:{}
        	};
        	this.form.staff.sortedStaff.push({staffKey:staffKey, name: staff.first_name + ' ' + staff.last_name});
        });
        
        this.form.staffItems.forEach(staffItem =>{
        	let staffKey = staffItem.staff_person.toString();
        	if (this.form.staff.hasOwnProperty(staffKey)) {
        		staffItem.id = null;
        		this.form.staff[staffKey].items[staffItem.type_name] = staffItem;
        		if (this.form.staff.itemTypes.indexOf(staffItem.type_name) === -1) {
	        		this.form.staff.itemTypes.push(staffItem.type_name);
	        	}
	        	newStaffItems.push(staffItem);
        	}
        });
        
        this.form.staff.sortedStaff = this.form.staff.sortedStaff.sort((a, b) => {if (a.name > b.name) {return 1;} else {return -1;}});
        this.form.staffItems = newStaffItems;
        this.fillMissingStaffItems();
    }
    
    fillMissingStaffItems() {
    	this.form.staff.sortedStaff.forEach(staff => {
    		this.form.staff.itemTypes.forEach(itemType => {
    			let theStaff = this.form.staff[staff.staffKey];
    			if (!theStaff.items.hasOwnProperty(itemType)) {
    				let staffItem = {
    					id: null,
    					staff_person: staff.staffKey,
    					staff_first_name: theStaff.first_name,
    					staff_last_name: theStaff.last_name,
    					position: theStaff.position,
    					type_name: itemType,
    					description: '',
    					cost: null
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
	        this.addItemType(this.modalActions.categoryName);
	    });
    }
    
    addItemType(typeName) {
    	if (this.form.staff.itemTypes.hasOwnProperty(typeName)) {
    		return;
    	}
    	this.form.staff.itemTypes.push(typeName);
    	this.fillMissingStaffItems();
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
    	
    	this.form.staff.sortedStaff.forEach(staff => {
    		let staffEntry = this.form.staff[staff.staffKey];
    		if (staffEntry.items.hasOwnProperty(typeName)) {
    			if (staffEntry.items[typeName].id) {
    				this.form.staff.deleteStaffItems.push(staffEntry.items[typeName]);
    			}
    			delete staffEntry.items[typeName];
    		}
    	});
    	this.form.$setDirty();
    }

    // ENDREGION: GET Calls

    // REGION: PUT Calls
    updateOrCreateAll() {
        this.updateOrCreateStaffItems();
        this.updateOrCreateOtherItems();
        this.deleteStaffItems();
        this.deleteOtherItems();
        this.$state.go('budgetList');
    }

    updateOrCreateForm() {
        if (this.isCreating) {
            this.service.createForm(this.form).then(
                response => {
                    this.budgetId = response.data.id;
                    this.updateOrCreateAll();
                    this.toastr.success(`${this.form.station_name} Budget Form Created Successfully!`);
                },
                error => {
                    this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
                }
            );
        } else {
            this.service.updateForm(this.budgetId, this.form).then(() => {
                this.toastr.success(`${this.form.station_name} Budget Form Updated Successfully!`);
            });
            this.updateOrCreateAll();
        }
    }

    updateOtherItem(item) {
        this.service.updateOtherItem(this.budgetId, item).catch(error => {
            this.toastr.error(`There was an error updating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
        });
    }

    createOtherItem(item) {
        this.service.createOtherItem(this.budgetId, item).catch(error => {
            this.toastr.error(`There was an error creating the budget form! ${JSON.stringify(error.data.non_field_errors)}`);
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
    	this.form.staff.sortedStaff.forEach(staff => {
	    	this.form.staff.itemTypes.forEach(itemType => {
	    		let staffItem = this.form.staff[staff.staffKey].items[itemType];
	    		staffItem.budget_calc_sheet = this.budgetId;
	    		if (staffItem.cost === '') {
	    			staffItem.cost = null;
	    		}
	    		if (staffItem.id) {
	            	this.service.updateStaffItem(this.budgetId, staffItem);
            	} else {
	            	this.service.createStaffItem(staffItem);
            	}
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
}
