import {BaseFormController} from '../baseFormController.js';
import StationModalController from './stationModal.controller';
import './borderStation.less';
const CheckboxGroup = require('../checkboxGroup.js');

import detailTemplate from './step-templates/detail.html';
import committeeTemplate from './step-templates/committeeNew.html';
import staffTemplate from './step-templates/staff/staff.html';
import staffNewTemplate from './step-templates/staffNew.html';
import locationTemplate from './step-templates/location/location.html';
import formsTemplate from './step-templates/forms.html';
import staffModalTemplate from './step-templates/staff/staffModal.html';
import staffWorkModalTemplate from './step-templates/staff/staffWorkModal.html';
import locationModalTemplate from './step-templates/location/locationModal.html';

import templateUrl from './borderStation.html';

class StaffWorkModalController {
    constructor($uibModalInstance, $scope, staff, parent) {
        this.$uibModalInstance = $uibModalInstance;
        this.staff = staff;
        this.parent = parent;
        this.financial_url = parent.$state.href('border-station', {
            id: staff.border_station,
        });
    }
    
    dismiss() {
        this.$uibModalInstance.dismiss();
    }
}

class BorderStationController extends BaseFormController  { 
    constructor($scope, $state, $stateParams, $timeout, $uibModal, BorderStationService, SessionService, toastr, SpinnerOverlayService) {
        'ngInject';
        super($scope, $stateParams);
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$uibModal = $uibModal;
        this.service = BorderStationService;
        this.session = SessionService;
        this.toastr = toastr;
        this.spinner = SpinnerOverlayService;
        this.isViewing = false;
        this.stationId = $stateParams.id;
        this.checkboxGroup = new CheckboxGroup();
        this.checkboxGroupQuestion = 1081;
        this.featureList = [
            "hasStaff","hasSubcommittee","hasProjectStats",
            "hasLocations","hasLocationStaffing","hasForms",
            "hasMDF"
        ];
        for (let idx=0; idx < this.featureList.length; idx++) {
            this.checkboxGroup.checkboxItem(this.checkboxGroupQuestion, this.featureList[idx]);
        }
        
        this.stepTemplates = [
            {template:detailTemplate, name:"Details"},
            {template:committeeTemplate, name:"Subcommittee"},
            {template:staffNewTemplate, name:"Staff"},
            {template:locationTemplate, name:"Locations"},
            {template:formsTemplate, name:"Forms"},
        ];
        
        this.setForms = this.session.checkPermission('PROJECTS','SET_FORMS',null, null);
        this.setFeatures = this.session.checkPermission('PROJECTS','SET_FEATURES',null, null);
        
        this.detailsQuestions = [948,949,950,951,953,954,955,956,1080,1081];
        this.originalDetailValues = {};
        this.lastCountry = null;
        this.staff = [];
        
        this.timeZoneOptions = [];
        this.countryOptions = [];
        this.projectCategoryOptions = [];
        this.formTypes = [];
        this.formOptions = {};
        this.formSelected = {};
        this.formSelectedOriginal = {};
        this.borderStationPresent = false;
        this.availableFormsPresent = false;
        this.loading = false;
        
        this.getStaff($stateParams.id);
        this.getAllCategories();
        this.getAllCountries();
        this.getAllTimeZones();
        this.getBorderStation($stateParams.id);
        this.getFormTypes();
        this.getUserProjects();
    }
    
    changeTab(tabIndex, isDisabled) {
        if (isDisabled) {
            return;
        }
        if (this.selectedStep === 0 && !this.response.storage_id && this.response.storage_id !== 0) {
            this.toastr.error('Details must be entered and saved before switching to a new tab');
            return;
        }
        if (this.selectedStep === 0 && this.haveDetailValuesChanged()) {
            if (window.confirm("Details information has been changed.\nSelect Ok to save changes.\nSelect Cancel to discard changes.")) {
                this.submit();
            } else {
                this.restoreDetailValues();
            }
        }
        
        if (this.selectedStep === 4 && this.haveFormsChanged()) {
            if (window.confirm("Forms information has been changed.\nSelect Ok to save changes.\nSelect Cancel to discard changes.")) {
                this.submit();
            } else {
                this.restoreForms();
            }
        }
        this.selectedStep = tabIndex;
    }
    
    inactiveTab(tabName) {
        let result = false;
        if (tabName ==='Subcommittee' && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasSubcommittee) {
            result = true;
        }
        if (tabName ==='Staff' && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasStaff) {
            result = true;
        }
        if (tabName === 'Locations' && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations) {
            result = true;
        }
        if (tabName === 'Forms' && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasForms) {
            result = true;
        }
        
        return result;
    }
    
    /*
     * The staff that has been added under the border station will be returned in the getBorderStation,
     * but that information will not include the project(s) on which they are assigned to work.
     * Also it will not include staff added under a different border station but assigned to work for
     * this border station.
     */
    getStaff(id) {
        this.service.getStaff(id).then((response) => {
            this.staff = response.data;
        });
    }
    
    getBorderStation(id) {
        this.spinner.show('Retrieving border station');
        this.service.getFormConfig('borderStation').then ((response) => {
            this.config = response.data;
            this.service.getBorderStation(id).then((response) => {
                this.processResponse(response);
                this.saveDetailValues();
                if (id && !this.session.checkPermission('PROJECTS','EDIT',this.questions[955].response.value, null)) {
                    this.isViewing = true;
                }
                this.borderStationPresent = true;
                if (this.availableFormsPresent) {
                    this.getCurrentForms();
                }
                if (this.questions[955].response.value) {
                    this.countryChange(this.questions[955].response.value);
                }
                this.checkboxGroup.initOriginalValues(this.questions);
                this.getProjects();
                this.setForms = this.session.checkPermission('PROJECTS','SET_FORMS',null, null);
        		this.setFeatures = this.session.checkPermission('PROJECTS','SET_FEATURES',null, null);
            }, () => {this.spinner.hide();});
        }, () => {this.spinner.hide();});
    }
    
    getProjects() {
        if (!this.questions[955].response.value || this.questions[955].response.value === this.lastCountry) {
            this.spinner.hide();
            return;
        }
        
        this.service.getProjects(this.questions[955].response.value).then ((response) => {
            this.projects = [];
            for (let stationIdx in response.data) {
                if (response.data[stationIdx].id === parseInt(this.stationId)) {
                    this.projects.push(response.data[stationIdx]);
                } else if (response.data[stationIdx].mdf_project === parseInt(this.stationId)) {
                    this.projects.push(response.data[stationIdx]);
                }
            }
            this.spinner.hide();
        }, () => {this.spinner.hide();});
    }
    
    saveDetailValues() {
        for (let idx=0; idx < this.detailsQuestions.length; idx++) {
            let question = this.detailsQuestions[idx];
            this.originalDetailValues[question] = this.questions[question].response.value;
        }
    }
    
    haveDetailValuesChanged() {
        this.questions[this.checkboxGroupQuestion].response.value = this.checkboxGroup.getValue(this.checkboxGroupQuestion);
        for (let idx=0; idx < this.detailsQuestions.length; idx++) {
            let question = this.detailsQuestions[idx];
            if (this.originalDetailValues[question] !== this.questions[question].response.value) {
                return true;
            }
        }
        return false;
    }
    
    restoreDetailValues() {
        for (let idx=0; idx < this.detailsQuestions.length; idx++) {
            let question = this.detailsQuestions[idx];
            this.questions[question].response.value = this.originalDetailValues[question];
        }
        this.checkboxGroup.initOriginalValues(this.questions);
    }
    
    getAllCountries() {
        this.service.getAllCountries().then((response) => {
        	this.countries = response.data.results;
            if (this.stationId !== null) {
                this.countryOptions = response.data.results;
            } else{
                var tmpCountry = response.data.results;
                this.countryOptions = [];
                for (var idx=0; idx < tmpCountry.length; idx++) {
                    if (this.session.checkPermission('PROJECTS','ADD',tmpCountry[idx].id, null)) {
                        this.countryOptions.push(tmpCountry[idx]);
                    }
                }
            }
        });
      }
    
    getCountryName(countryId) {
    	let countryName = 'Unknown';
    	for (let idx in this.countries) {
    		if (countryId === this.countries[idx].id) {
    			countryName = this.countries[idx].name;
    			break;
    		}
    	}
    	
    	return countryName;
    }
    
    getAllCategories() {
        this.service.getAllProjectCategories().then((response) => {
            var tmpCategories = response.data;
            this.projectCategoryOptions = [];
            for (var idx=0; idx < tmpCategories.length; idx++) {
                this.projectCategoryOptions.push(tmpCategories[idx]);
            }
        });
      }
    
    getAllTimeZones() {
        this.service.getAllTimeZones().then((response) => {
            this.timeZoneOptions = response.data;
        });
    }
    
    getFormTypes() {
        this.service.getFormTypes().then(response => {
            this.formTypes = response.data.results;
            for (let idx = 0; idx < this.formTypes.length; idx++) {
                this.formOptions[this.formTypes[idx].name] = [];
            }
            this.getAvailableForms();
        });
    }

    getAvailableForms() {
        this.service.getAvailableForms().then(response => {
            let avail = response.data;
            for (let idx = 0; idx < avail.length; idx++) {
                this.formOptions[avail[idx].form_type.name].push(avail[idx]);
            }
            this.availableFormsPresent = true;
            if (this.borderStationPresent) {
                this.getCurrentForms();
            }
        });
    }

    getCurrentForms() {
        this.formSelected = {};
        this.formSelectedOriginal = {};
        if (this.questions[964].response.value) {
            for (let idx=0; idx < this.questions[964].response.value.length; idx++) {
                let formId = this.questions[964].response.value[idx];
                for (let property in this.formOptions) {
                    for (let idx2=0; idx2 < this.formOptions[property].length; idx2++) {
                        let optionFormId = this.formOptions[property][idx2].id;
                        if (optionFormId === formId) {
                            this.formSelected[property] = optionFormId;
                            this.formSelectedOriginal[property] = optionFormId;
                        }
                    }
                }
            }
        }
    }
    
    haveFormsChanged() {
        for (let property in this.formOptions) {
            if (property in this.formSelected) {
                if (property in this.formSelectedOriginal && this.formSelected[property] === this.formSelectedOriginal[property]) {
                    // matching values
                } else {
                    return true;
                }
            } else if (property in this.formSelectedOriginal) {
                return true;
            }
        }
        
        return false;
    }
    
    restoreForms() {
        this.formSelected = {};
        for (let property in this.formOptions) {
            if (property in this.formSelectedOriginal) {
                this.formSelected[property] = this.formSelectedOriginal[property];
            }
        }
        
    }
    
    changeStationStatus() {
        this.questions[948].response.value = !this.questions[948].response.value;
    }
    
    canMdfFlagBeChanged() {
        if (!this.checkboxGroup.questions[this.checkboxGroupQuestion].hasMDF) {
            
        }
    }
    
    
    checkFeatures(modifiedFeature) {
        let idx=0;
        let cards = this.getCardInstances('Commitee Members');
        let activeSubcommittee = cards.length > 0;
        cards = this.getCardInstances('Staff');
        let activeStaff = false;
        for (idx=0; idx < cards.length; idx++) {
            if (!this.getResponseOfQuestionById(cards[idx].responses, 970).value) {
                activeStaff = true;
                break;
            }
        }
        cards = this.getCardInstances('Location');
        let activeLocations = false;
        for (idx=0; idx < cards.length; idx++) {
            if (this.getResponseOfQuestionById(cards[idx].responses, 973).value) {
                activeLocations = true;
                break;
            }
        }
        
        let activeForms = false;
        for (idx=0; idx < this.formTypes.length; idx++) {
            if (this.formSelected[this.formTypes[idx].name]) {
                activeForms = true;
            }
        }
        
        if (activeSubcommittee && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasSubcommittee) {
            this.checkboxGroup.questions[this.checkboxGroupQuestion].hasSubcommittee = true;
            this.toastr.error('hasSubcommittee cannot be disabled with active subcommittee members');
        }
        
        if (activeStaff && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasStaff) {
            this.checkboxGroup.questions[this.checkboxGroupQuestion].hasStaff = true;
            this.toastr.error('hasStaff cannot be disabled with active staff members');
        }
        
        if (activeLocations && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations) {
            this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations = true;
            this.toastr.error('hasLocations cannot be disabled with active locations');
        }
        
        if (activeForms && !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasForms) {
            this.checkboxGroup.questions[this.checkboxGroupQuestion].hasForms = true;
            this.toastr.error('hasForms cannot be disabled with configured forms');
        }
        
        if (this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocationStaffing) {
            if (!this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations ||
                    !this.checkboxGroup.questions[this.checkboxGroupQuestion].hasStaff) {
                if (modifiedFeature === 'hasLocationStaffing') {
                    this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocationStaffing = false;
                    this.toastr.error('hasLocationStaffing can only be enabled when both hasStaff and hasLocations are enabled');
                } else if (modifiedFeature === 'hasLocations') {
                    this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations = true;
                    this.toastr.error('hasLocations cannot be disabled when hasLocationStaffing is enabled');
                } else if (modifiedFeature === 'hasStaff') {
                    this.checkboxGroup.questions[this.checkboxGroupQuestion].hasLocations = true;
                    this.toastr.error('hasStaff cannot be disabled when hasLocationStaffing is enabled');
                }
            }
        }
        
        if (this.checkboxGroup.questions[this.checkboxGroupQuestion].hasMDF) {
            for (let idx=0; idx < this.staff.length; idx++) {
                if (this.staff[idx].works_on[0].financial.project_id + '' !== this.$stateParams.id) {
                    this.checkboxGroup.questions[this.checkboxGroupQuestion].hasMDF = false;
                    this.toastr.error('hasMDF cannot be enabled when staff from project ' + 
                            this.staff[idx].works_on[0].financial.project_name  + ' has work assigned');
                }
            }
            this.questions[1084].response.value = null;
        } else {
            let projects = '';
            let sep = '';
            for (let idx=0; idx < this.projects.length; idx++) {
                if (this.projects[idx].id + '' !== this.$stateParams.id) {
                    projects += sep + this.projects[idx].station_name;
                    sep = ', ';
                }
            }
            if (projects !== '') {
                this.checkboxGroup.questions[this.checkboxGroupQuestion].hasMDF = true;
                this.toastr.error('hasMDF cannot be disabled when other projects have defined it as their MDF project [' + projects + ']');
            } 
        }
    }
    
    getOtherLocationNames() {
        let nameList = [];
        let cards = this.getCardInstances('Location');
        for (let cardIdx in cards) {
            nameList.push(this.getResponseOfQuestionById(cards[cardIdx].responses, 963).value);
        }
        
        return nameList;
    }
    
    getUserProjects() {
        this.service.getUserStations(this.session.user.id, 'PROJECTS', 'VIEW').then((response) => {
           	this.projects = response.data;
           	this.getStaffList();
           	this.getSubcommitteeList();
        });
    }
    
    getStaffList() {
	    this.service.getStaffList([
	    	{"name": "page_size", "value": 1000},
	    	{"name": "reverse", "value": false},
	    	{"name": "ordering", "value": 'first_name, last_name'},
	    	{"name": "project_id", "value": this.stationId},
	    	]).then ((response) => {
	            this.staffList = response.data.results;
	            this.projectText(this.staffList);
		        for (let idx=0; idx < this.staffList.length; idx++) {
		            let staff = this.staffList[idx];
		            if (this.session.checkPermission('STAFF','EDIT',null, null)) {
		            	staff.url = this.$state.href('staff', {id:staff.id, isViewing:false });
		            } else {
			            staff.url = this.$state.href('staff', {id:staff.id, isViewing:true});
			        }
		        }
	    });
    }
    
    getSubcommitteeList() {
    	this.service.getSubcommitteeList([
    		{"name": "page_size", "value": 1000},
	    	{"name": "reverse", "value": false},
	    	{"name": "ordering", "value": 'first_name, last_name'},
	    	{"name": "project_id", "value": this.stationId},
	    	]).then ((response) => {
	            this.subcommitteeList = response.data.results;
		        for (let idx=0; idx < this.subcommitteeList.length; idx++) {
		            let subcommittee = this.subcommitteeList[idx];
		            if (this.session.checkPermission('SUBCOMMITTEE','EDIT',null, null)) {
		            	subcommittee.url = this.$state.href('subcommittee', {id:subcommittee.id, isViewing:false });
		            } else {
			            subcommittee.url = this.$state.href('subcommittee', {id:subcommittee.id, isViewing:true});
			        }
		        }
		});
    }
    
    projectText(staffList) {
    	for (let idx=0; idx < staffList.length; idx++) {
            let staff = staffList[idx];
            staff.projectText = '';
            let sep = '';
            for (let staffProjIdx in staff.staffproject_set) { 
            	for (let projIdx in this.projects) {
            		if (staff.staffproject_set[staffProjIdx].border_station === this.projects[projIdx].id) {
		            	staff.projectText += sep + this.projects[projIdx].station_name;
		            	sep = '/';
		            }
            	}
            }
        }
    }
    
    sortedLocationCards() {
        // shallow copy array of cards
        let cards = this.getCardInstances('Location').concat();
        cards.sort((a,b) => {
            let aName = this.getResponseOfQuestionById(a.responses, 963).value;
            let bName = this.getResponseOfQuestionById(b.responses, 963).value;
            if (aName > bName) {
                return 1;
            }
            if (bName > aName) {
                return -1;
            }
            return 0;
        });
        return cards;
    }
    
    sortedPersonCards(inCards) {
        // shallow copy array of cards
        let cards = inCards.concat();
        cards.sort((a,b) => {
            let aName = this.getResponseOfQuestionById(a.responses, 957).value + ' ' + this.getResponseOfQuestionById(a.responses, 958).value;
            let bName = this.getResponseOfQuestionById(b.responses, 957).value + ' ' + this.getResponseOfQuestionById(b.responses, 958).value;
            if (aName > bName) {
                return 1;
            }
            if (bName > aName) {
                return -1;
            }
            return 0;
        });
        return cards;
    }
    
    openCommonModal(the_card, isAdd, cardIndex, theController, theControllerName, theTemplate, config_name, restrictNameList=null) {
        let config = this.config[config_name];      
        let starting_flag_count = the_card.flag_count;
        let staffList = [];
        if (config_name === 'Staff') {
            staffList = this.staff;
        }
        let params = {
                staffList: staffList,
                projectId: this.stationId,
                projects: this.projects
            };
        this.modalActions = [];
        this.$uibModal.open({
            bindToController: true,
            controller: theController,
            controllerAs: theControllerName,
            resolve: {
                isAdd: () => isAdd,
                card: () => the_card,
                isViewing: () => this.isViewing,
                modalActions: () => this.modalActions,
                config: () => config,
                constants: () => null,
                restrictNameList: () => restrictNameList,
                params: () => params,
            },
            size: 'lg',
            templateUrl: theTemplate,
        }).result.then(() => {
            let cards = this.getCardInstances(config_name);
            if (this.modalActions.indexOf('removeCard') > -1 && cardIndex !== null) {
                if (window.confirm("Confirm that you wish to remove this entry")) {
                    for (let idx in this.staff) {
                        if (cards[cardIndex].storage_id !== null) {
                            if (cards[cardIndex].storage_id === this.staff[idx].id) {
                                this.staff.splice(idx, 1);
                            }
                        }
                    }
                    cards.splice(cardIndex, 1);
                    this.redFlagTotal = this.redFlagTotal - starting_flag_count;
                    this.submit();
                }
            } else {
                this.redFlagTotal = this.redFlagTotal + the_card.flag_count - starting_flag_count;
                if (isAdd) {
                    cards.push(the_card);
                }
                this.submit();
            }
        });
    }
    countryChange(country_id) {
        let params = [{name:'operating_country', value:country_id}];
        this.service.getBorderStations(true, params).then(response => {
            this.mdfProjects = [];
            for (let idx=0; idx < response.data.length; idx++) {
                if (response.data[idx].features.indexOf('hasMDF') !== -1) {
                    this.mdfProjects.push(response.data[idx]);
                }
            }
        });
    }
    
    openCommitteeModal(card=null, isAdd = false, idx=null) {
        this.commonModal(card, isAdd, idx, StationModalController, 'CommitteeModalController',
                committeeModalTemplate, 'Commitee Members');
    }
    
    openStaffModal(card=null, isAdd = false, idx=null) {
        this.commonModal(card, isAdd, idx, StationModalController, 'StaffModalController',
                staffModalTemplate, 'Staff');
    }
    
    openLocationModal(card=null, isAdd = false, idx=null) {
        this.commonModal(card, isAdd, idx, StationModalController, 'LocationModalController',
                locationModalTemplate, 'Location', this.getOtherLocationNames());
    }
    
    openStaffWorkModal(staff) {
        this.$uibModal.open({
            bindToController: true,
            controller: StaffWorkModalController,
            controllerAs: 'StaffModalController',
            resolve: {
                staff: () => staff,
                parent: () => this
            },
            size: 'lg',
            templateUrl: staffWorkModalTemplate,
        }).result.then(() => {
            
        });
    }
    
    prepareForms() {
        let formList = [];
        for (let property in this.formSelected) {
            if (this.formSelected[property]) {
                formList.push(this.formSelected[property]);
            }
        }
        this.questions[964].response.value = formList;
    }
    
    /*
     * Set header color when staff is assigned to work on another project
     */
    stationHeaderClass(card) {
        let cls = 'panel-heading margin-top-0';
        if (card.storage_id) {
            for (let staffIdx in this.staff) {
                if (this.staff[staffIdx].id === card.storage_id) {
                    for (let workIdx in this.staff[staffIdx].works_on) {
                        if (this.staff[staffIdx].works_on[workIdx].works_on.project_id !== parseInt(this.stationId)) {
                            cls += ' financialProject';
                        }
                    }
                }
            }
        }
        
        return cls;
    }
    
    updateWorkAssignent() {
        for (let staffIdx in this.staff) {
            if (this.staff[staffIdx].id === null) {
                let staffCards = this.getCardInstances('Staff');
                for (let idx in staffCards) {
                    let card = staffCards[idx];
                    let lastDate = this.getResponseOfQuestionById(card.responses, 970).value;
                    if (lastDate !== null) {
                        continue;
                    }
                    let first_name = this.getResponseOfQuestionById(card.responses, 957).value;
                    let last_name = this.getResponseOfQuestionById(card.responses, 958).value;
                    if (first_name === this.staff[staffIdx].first_name && last_name === this.staff[staffIdx].last_name) {
                        this.staff[staffIdx].id = card.storage_id;
                        break;
                    }
                }
                if (this.staff[staffIdx].id === null) {
                    alert('unable to find staff card for added staff');
                }
            }
        }
        
        this.service.updateWorkAssignment(this.stationId, this.staff).then((response) => {
            this.staff = response.data;
        }, (error) => {
            alert('updateWorkAssignment failed: ' + error)
           });
    }
    
    submit() {
        this.errorMessages = [];
        this.warningMessages = [];
        this.prepareForms();
        this.checkboxGroup.updateResponses();
        this.spinner.show('Saving changes...');
        this.service.submitBorderStation(this.stationId, this.response).then((response) => {
             this.spinner.hide();
             this.processResponse(response);
             this.stationId = response.data.storage_id;
             this.updateWorkAssignent();
             this.saveDetailValues();
             if (this.availableFormsPresent) {
                 this.getCurrentForms();
             }
             this.session.getUserPermissions();  // Refreshes border station list in navbar
             this.toastr.success('Changes saved');
             this.getProjects();
         }, (error) => {
             this.spinner.hide();
             this.set_errors_and_warnings(error.data);
             this.response.status = this.saved_status;
            });
        
        this.messagesEnabled = true;
    }
}


export default {
    templateUrl,
    controller: BorderStationController,
};