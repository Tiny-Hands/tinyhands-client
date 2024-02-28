/* global jQuery */
import './staff.less';
const CheckboxGroup = require('../checkboxGroup.js');

const DateData = require('../dateData.js');

import basicTemplate from './step-templates/basic.html';
import contractTemplate from './step-templates/contract.html';
import knowledgeTemplate from './step-templates/knowledge.html';
import reviewTemplate from './step-templates/review.html';
import AddProjectModalTemplate from './step-templates/addProjectModal.html';
import AddAttachmentModalTemplate from './step-templates/addAttachmentModal.html';

class AddProjectModalController {
	constructor($uibModalInstance, staff, projects, coordinator, session) {
	    'ngInject';
		this.$uibModalInstance = $uibModalInstance;
		this.staff = staff;
		this.projects = projects;
		this.coordinator= coordinator;
		
		this.displayProjects = [];
		for (let projIdx in this.projects) {
			if (this.projects[projIdx].operating_country + '' !== this.staff.country) {
				continue;
			}
			if (!session.checkPermission('STAFF','EDIT_BASIC', this.projects[projIdx].operating_country,this.projects[projIdx].id)) {
				continue;
			}
			let found = false;
			for (let staffIdx in this.staff.staffproject_set) {
				if (this.projects[projIdx].id === this.staff.staffproject_set[staffIdx].border_station) {
					found = true;
				}
			}
			if (!found) {
				this.displayProjects.push({"project":this.projects[projIdx], "toAdd":false});
			}
		}
	}
	
	addedProjectCount() {
		let count = 0;
		for (let projIdx in this.displayProjects) {
			if (this.displayProjects[projIdx].toAdd) {
				count += 1;
			}
		}
		return count;
	}
	
	addProjects() {
		for (let projIdx in this.displayProjects) {
			if (this.displayProjects[projIdx].toAdd) {
				this.staff.staffproject_set.push(
					{
						"id": null,
						"staff": this.staff.id,
						"border_station": this.displayProjects[projIdx].project.id,
						"receives_money_distribution_form": false,
						"coordinator":"",
						"project_category":this.displayProjects[projIdx].project.project_category_name,
					});
				this.coordinator[this.displayProjects[projIdx].project.id] = {
            		options: [
            			{label:"Accounting"},
            			{label:"Awareness"},
            			{label:"Care"},
            			{label:"Investigations"},
            			{label:"Legal"},
            			{label:"Records"},
            			{label:"Security"},
            			{label:"Shelter"}
            		],
            		selectedOptions:[],
            		settings: {smartButtonMaxItems:2, showCheckAll: false, showUncheckAll: false},
            	};
			}
		}
		this.$uibModalInstance.close();
	}

	cancel() {
		this.$uibModalInstance.dismiss();
	}
}

class AddAttachmentModalController {
    constructor($uibModalInstance, isAdd, card, isViewing, modalActions, parentController) {
        'ngInject';
        this.$uibModalInstance = $uibModalInstance;
        this.isAdd = isAdd;
        this.card = card;
        this.modalActions = modalActions;
        this.parentController = parentController;
        
        this.expirationDate = null;
        if (this.card.expiration_date !== null) {
            let dateData = new DateData();
            this.expirationDate = dateData.dateAsUTC(this.card.expiration_date);
        }
    }
    
    isString(value) {
        return this.parentController.isString(value);
    }
    
    getScannedFormUrl(value) {
        return this.parentController.getScannedFormUrl(value);
    }
 
    close() {
        this.$uibModalInstance.close();
    }

    dismiss() {
        this.$uibModalInstance.dismiss();
    }
    
    delete() {
        this.modalActions.push('removeCard');
        this.$uibModalInstance.close();
    }
    
    canSave() {
        if (!this.card.option || !this.card.attachment) {
            return false;
        }
        
        if (this.card.option === 'Contract' && this.expirationDate === null) {
            return false;
        }
        
        return true;
    }

    save() {
        let dateData = new DateData();
        if (this.expirationDate) {
            this.card.expiration_date = dateData.dateToString(this.expirationDate);
        } else {
            this.card.expiration_date = null;
        }
        this.close();
    }
}

const reviewMertrics = 'leadership;obedience;faithfulness;alertness;questioning;awareness';

export default class StaffController {
    constructor($uibModal, constants, StaffService, $stateParams, $state, SpinnerOverlayService, $uibModalStack, SessionService, toastr) {
        'ngInject';
        
        this.stateParams = $stateParams;
        this.modalStack = $uibModalStack;
        this.$uibModal = $uibModal;
        this.constants = constants;
        this.service = StaffService;
        this.state = $state;
        this.spinner = SpinnerOverlayService;
        this.relatedUrl = null;
        this.session = SessionService;
        this.toastr = toastr;
        this.isViewing = this.stateParams.isViewing === 'true';
        this.staff = null;
        this.projectsById=[];
        this.countries = [];
        this.basicView = true;
        this.basicEdit = false;
        this.educationOptions = [
        	'None',
        	'Primary',
        	'Secondary',
        	'Vocational School',
        	'Certificate Program',
        	'Diploma',
        	"Associate's Degree",
        	"Bachelor's Degree",
        	'Graduate Degree'];
        this.positionOptions = [
            'Finanace',
            'Compliance Officer',
            'Counselor',
            'Data Entry Specialist',
            'Driver',
            'Investigator',
            'Lawyer',
            'Office Assitant',
            'Police Liaison',
            'Project Manager',
            'SFE Counselor',
            'Shelter Care',
            'Spiritual Care Coordinator',
            'Station Manager',
            'Transit Monitor'];
        this.limitedPositions = {
        	'Compliance Officer':['National Office'],
        	'Counselor':['National Office'],
        	'Data Entry Specialist':['National Office'],
        	'Police Liaison':['National Office'],
        	'Project Manager':['National Office'],
        	'Spiritual Care Coordinator':['National Office'],
        };
        this.checkboxGroup = new CheckboxGroup();
        for (let positionIndex in this.positionOptions) {
            this.checkboxGroup.checkboxItem('position', this.positionOptions[positionIndex]);
        }
        this.contractView = false;
        this.contractEdit = false;
        this.contract = null;
        this.currency = '';
        this.dropDecimal = false;
        this.knowledgeView = true;
        this.knowledgeEdit = false;
        this.knowledge = null;
        this.knowledgeDates= {
        	items:		['general','awareness','security','accounting','pv_care','paralegal','records','shelter'],
        	itemLabels:	['General','Awareness','Security','Accounting','PV Care','Paralegal','Records','Shelter']
        };
        
        this.knowledgeMap = {
        	general:null,
        	awareness:['Awareness'],
        	security:['Security'],
        	accounting:['Accounting'],
        	pv_care:['Care'],
        	paralegal:['Legal'],
        	records:['Records'],
        	shelter:['Shelter']
        };
        this.reviewView = false;
        this.reviewEdit = false;
        this.reviews = null;
        this.reviewDate = null;
        this.requestCount = 0;
        
        this.coordinator = {};
        
        let current = new Date();
        this.lastYear = current.getFullYear();
        this.lastMonth = current.getMonth();
        if (this.lastMonth < 1) {
        	this.lastYear -= 1;
        	this.lastMonth = 12;
        }
        
        this.stepTemplates = [];
        
        this.selectedStep = 0;
        this.isRemove = false;
        this.attachmentType = '';
        
        this.getUserCountries();
        this.getUserProjects();
    }
    
    changeTab(tabIndex) {
    	let base = this.stepTemplates[this.selectedStep].name.toLowerCase();
    	if (this[base + 'Modified']()) {
    		// Information on current tab has been modified
    		
    		if (base + 'ReadyToSave' in this && !this[base + 'ReadyToSave']()) {
    			// Information on current tab is not ready to be saved
    			if (window.confirm(this.stepTemplates[this.selectedStep].name + " information has been changed and is not ready to be saved.\nSelect Ok to continue working on current tab.\nSelect Cancel to discard changes")) {
	    			return;
	    		} else {
	    			this[base + 'Discard']();
	 			}
    		} else {
    			// Information on current tab can be saved		
    			
	    		if (window.confirm(this.stepTemplates[this.selectedStep].name + " information has been changed.\nSelect Ok to save changes.\nSelect Cancel to discard changes")) {
	    			this[base + 'Save']();
	    		} else {
	    			this[base + 'Discard']();
	    		}
    		}
    	}
        this.selectedStep = tabIndex;
    }
    
    getUserProjects() {
    	this.spinner.show("Get Staff...");
    	this.getAllProjects();
        this.service.getUserStations(this.session.user.id).then((response) => {
           	this.projects = response.data;
           	this.getStaff();
           	
        }, () => {
        	if (this.requestCount < 1) {
        		this.spinner.hide();
        	}
        });
    }
    
    getAllProjects() {
    	this.projectsById=[];
    	this.requestCount++;
    	this.service.getAllBorderStations().then((response) => {
    		this.projectsById = _.keyBy(response.data, (x) => x.id);
    		this.requestCount--;
    		if (this.requestCount < 1) {
    			this.requestCount = 0;
    			this.spinner.hide();
    		}
    	}, () => {
    		this.requestCount--;
    		if (this.requestCount < 1) {
    			this.requestCount = 0;
    			this.spinner.hide();
    		}
    	});
    }
    
    getUserCountries() {
    	this.projectsById=[];
        this.service.getUserCountries(this.session.user.id).then((response) => {
           	this.countries = [];
           	for (let countryIndex in response.data) {
           		if (this.session.checkPermission('STAFF','VIEW_BASIC',response.data[countryIndex].id, null) === true) {
           			this.countries.push(response.data[countryIndex]);
           		}
           	}
        });
    }
    
    checkAnyPermission(projectList, permission) {
    	let result = this.session.checkPermission('STAFF',permission, this.staff.country, null);
    	if (!result) {
	    	for (let projIdx in projectList) {
	    		if (this.session.checkPermission('STAFF',permission,projectList[projIdx].country_id, projectList[projIdx].border_station) === true) {
	    			result = true;
	    			break;
	    		}
	    	}
    	}
    	
    	return result;
    }
    
    checkForPermission(projectList, permission) {
    	let result = this.session.checkPermission('STAFF',permission, this.staff.country, null);
    	if (!result) {
	    	for (let projIdx in projectList) {
	    		if (this.session.checkPermission('STAFF',permission,projectList[projIdx].country_id, projectList[projIdx].border_station) === true) {
	    			result = true;
	    		} else {
	    			result = false;
	    			break;
	    		}
	    	}
    	}
    	
    	return result;
    }
    
	getProjectName(projectId) {
    	let projectName = 'Unknown';
    	let project = this.projectsById[projectId];
    	if (project) {
    		projectName = project.station_name;
    	}
 		return projectName;
    }
    
    getProjectRef(projectId) {
    	return this.state.href('border-station', {id:projectId, isViewing:false });
    }

	/*
	 * Basic tab methods
	*/
    getStaff() {
    	this.requestCount++;
        this.service.getStaff(this.stateParams.id).then((response) => {
        	this.requestCount--;
            this.staff = response.data;
            this.processBasicData();
        }, () => {
        	this.requestCount--;
        	if (this.requestCount < 1) {
        		this.requestCount = 0;
        		this.spinner.hide();
        	}
        });
    }
    
    // called after initial retrieval or update of basic data
    processBasicData() {
    	this.stepTemplates = [
            {template:basicTemplate, name:"Basic", modified:'basicModified', save:this.basicSave, discard:this.basicDiscard},
        ];
    	this.basicEdit = this.checkForPermission(this.staff.staffproject_set, 'EDIT_BASIC') || this.staff.id === null;
    	this.contractViewAny = this.checkAnyPermission(this.staff.staffproject_set, 'VIEW_CONTRACT') && this.staff.id !== null;
        this.contractView = this.checkForPermission(this.staff.staffproject_set, 'VIEW_CONTRACT')  && this.staff.id !== null;
        this.contractEdit = this.checkForPermission(this.staff.staffproject_set, 'EDIT_CONTRACT');
        if (this.contractViewAny) {
        	this.stepTemplates.push({template:contractTemplate, name:"Contract", modified:this.contractModified, save:this.contractSave, discard:this.contractDiscard});
	        this.getStaffContract();
        }
        this.knowledgeView = true && this.staff.id !== null;
        this.knowledgeEdit = this.checkForPermission(this.staff.staffproject_set, 'EDIT_BASIC');
        if (this.knowledgeView) {
        	this.stepTemplates.push({template:knowledgeTemplate, name:"Knowledge", modified:this.knowledgeModified, save:this.knowledgeSave, discard:this.knowledgeDiscard});
        	this.getStaffKnowledge();
        }
        this.reviewView = this.checkForPermission(this.staff.staffproject_set, 'VIEW_REVIEW') && this.staff.id;
        this.reviewEdit = this.checkForPermission(this.staff.staffproject_set, 'EDIT_REVIEW');
        if (this.reviewView) {
        	this.stepTemplates.push({template:reviewTemplate, name:"Reviews", modified:this.reviewsModified, save:this.reviewsSave, discard:this.reviewsDiscard});
        	this.getStaffReviews();
        }
        this.canDelete = this.session.checkPermission('STAFF','DELETE', this.staff.country, null);
        this.staff.country = this.staff.country + '';
        let dateData = new DateData();
        this.startDate = dateData.dateAsUTC(this.staff.first_date);
        if (this.staff.id_card_expiration) {
            this.idExpirationDate = dateData.dateAsUTC(this.staff.id_card_expiration);
        } else {
            this.idExpirationDate = null;
        }
        this.lastDate = null;
        if (this.requestCount < 1) {
        	this.spinner.hide();
        }
        this.positionQuestion = {position:{response:{value: this.staff.position}}};
        this.checkboxGroup.initOriginalValues(this.positionQuestion);
        this.coordinator = {};
        for (let projIdx in this.staff.staffproject_set) {
        	let project = this.staff.staffproject_set[projIdx];
        	this.coordinator[project.border_station] = {
        		options: [
        			{label:"Accounting"},
        			{label:"Awareness"},
        			{label:"Care"},
        			{label:"Investigations"},
        			{label:"Legal"},
        			{label:"Records"},
        			{label:"Security"},
        			{label:"Shelter"}
        		],
        		selectedOptions:[],
        		settings: {smartButtonMaxItems:2, showCheckAll: false, showUncheckAll: false},
        	};
        	
        	let selOptions = project.coordinator.split(';');
        	for (let selIdx in selOptions) {
        		for (let opIdx in this.coordinator[project.border_station].options) {
        			if (selOptions[selIdx] === this.coordinator[project.border_station].options[opIdx].label) {
        				this.coordinator[project.border_station].selectedOptions.push(this.coordinator[project.border_station].options[opIdx]);
        			}
        		}
        	}
        }
        this.staffOriginal = jQuery.extend(true, {}, this.staff);
    }
    
    updateCoordinatorOptions() {
    	for (let projIdx in this.staff.staffproject_set) {
    		let project = this.staff.staffproject_set[projIdx];
    		let selectedLabels = [];
    		if (project.coordinator) {
    			selectedLabels = project.coordinator.split(';');
    		}
    		let newOptions = this.getCoordinatorOptions(selectedLabels);
    		this.coordinator[project.border_station].options = newOptions;
    		this.coordinator[project.border_station].selectedOptions = [];
    		for (let selIdx in selectedLabels) {
        		for (let opIdx in this.coordinator[project.border_station].options) {
        			if (selectedLabels[selIdx] === this.coordinator[project.border_station].options[opIdx].label) {
        				this.coordinator[project.border_station].selectedOptions.push(this.coordinator[project.border_station].options[opIdx]);
        			}
        		}
        	}
    	}
    }
    
    getCoordinatorOptions(selectedLabels) {
    	let options = [{label:"Investigations"}];
    	let neededLabels = [];
    	for (let labelIndex in selectedLabels) {
    		if (selectedLabels[labelIndex] !== 'Investigations') {
    			neededLabels.push(selectedLabels[labelIndex]);
    		}
    	}
    	for (let key in this.knowledgeMap) {
    		if (this.knowledgeMap[key] === null) {
    			continue;
    		}
    		
    		if (this.knowledgeDates[key] !== null) {
    			for (let labelIndex in this.knowledgeMap[key]) {
    				let found = false;
    				for (let neededIndex in neededLabels) {
    					if (this.knowledgeMap[key][labelIndex] === neededLabels[neededIndex]) {
    						found = true;
    					}
    				}
    				if (!found) {
    					neededLabels.push(this.knowledgeMap[key][labelIndex]);
    				}
    			}
    		}
    	}
    	neededLabels = neededLabels.sort();
    	for (let neededIndex in neededLabels) {
    		options.push({label:neededLabels[neededIndex]});
    	}
    	return options;
    }
    
    basicPreSave() {
    	let dateData = new DateData();
    	this.staff.first_date = dateData.dateToString(this.startDate);
    	if (this.idExpirationDate) {
    	    this.staff.id_card_expiration = dateData.dateToString(this.idExpirationDate);
    	} else {
    	    this.staff.id_card_expiration = null;
    	}
    	this.staff.position = this.checkboxGroup.getValue('position');
    	for (let projIdx in this.staff.staffproject_set) {
    		let project = this.staff.staffproject_set[projIdx];
    		let tmp = '';
    		let sep = '';
    		for (let selIdx in this.coordinator[project.border_station].selectedOptions) {
    			tmp += sep + this.coordinator[project.border_station].selectedOptions[selIdx].label;
    			sep = ';';
            			
            }
            project.coordinator = tmp;
    	}
    }
    
    basicModified() {
    	this.basicPreSave();
    	for (let item in this.staff) {
    		if ("staffproject_set;miscellaneous;contract_data;knowledge_data;review_data".indexOf(item) >= 0) {
    			continue;
    		}
    		
    		if (this.staff[item] !== this.staffOriginal[item]) {
    			return true;
    		}
    	}
    	
    	if (this.staff.staffproject_set.length !== this.staffOriginal.staffproject_set.length) {
    		return true;
    	}
    		
    	for (let projIndex in this.staff.staffproject_set) {
    		for (let item in this.staff.staffproject_set[projIndex]) {
    			if (item.startsWith("$")) {
    				continue;
    			}
    			if (this.staff.staffproject_set[projIndex][item] !== this.staffOriginal.staffproject_set[projIndex][item]) {
    				return true;
    			}
    		}
    	}
    	
    	for (let miscIndex in this.staff.miscellaneous) {
    		for (let item in this.staff.miscellaneous[miscIndex]) {
    			if (item.startsWith("$") || item === 'type_detail') {
    				continue;
    			}
    			if (this.staff.miscellaneous[miscIndex][item] !== this.staffOriginal.miscellaneous[miscIndex][item]) {
    				return true;
    			}
    		}
    	}
    	
    	return false;
    }
    
    showPosition(position) {
    	let result = true;
    	if (!this.checkboxGroup.questions['position'][position]) {
    		if (this.limitedPositions.hasOwnProperty(position)) {
    			result = false;
    			for (let categoryIndex in this.limitedPositions[position]) {
    				let category = this.limitedPositions[position][categoryIndex];
    				for (let projectIndex in this.staff.staffproject_set) {
    					if (this.staff.staffproject_set[projectIndex].project_category === category) {
    						result = true;
    						break;
    					}
    				}
    			}
    		}
    	}
    	return result;
    }
    
    miscSaveItem (miscIndex) {
    	this.service.submitMiscellaneous(this.staff.miscellaneous[miscIndex]).then((response) => {
 			this.staff.miscellaneous[miscIndex] = jQuery.extend(true, {}, response.data);
 			this.requestCount--;
 			if (this.requestCount <= 0) {
 				this.requestCount = 0;
 				this.spinner.hide();
 			}
 		}, () => {
 			this.toastr.error("Failed to save miscellaneous information");
 			this.requestCount--;
 			if (this.requestCount <= 0) {
 				this.requestCount = 0;
 				this.spinner.hide();
 			}
 		});
    }
    
    basicSave() {
    	this.basicPreSave();
    	if (this.staff.last_date !== null) {
    		this.staff.staffproject_set = [];
    	}
    	let keepMiscellaneous = this.staff.miscellaneous;
    	this.spinner.show("Saving Basic..."); 
        this.service.submitStaff(this.staff).then((response) => {
             this.staff = response.data;
             if (this.staff.last_date !== null) {
             	// Staff was deleted - go back to list
             	this.state.go('staffList');
             }
             this.staff.miscellaneous = keepMiscellaneous;
             if (this.staff.miscellaneous.length > 0) {
             	this.request_count = 0;
             	for (let miscIndex in this.staff.miscellaneous) {
             		this.requestCount++;
             		if (this.staff.miscellaneous[miscIndex].staff === null) {
             			this.staff.miscellaneous[miscIndex].staff = this.staff.id;
             		}
             		this.miscSaveItem(miscIndex);
             	}
             } else {
             	if (this.requestCount < 1) {
             		this.spinner.hide();
             	}
             }
             this.stepTemplates = [
	            {template:basicTemplate, name:"Basic", modified:'basicModified', save:this.basicSave, discard:this.basicDiscard},
	        ];
             this.processBasicData();
         }, (error) => {
         	this.spinner.hide();
         	this.toastr.error("Failed to save basic information");
            this.set_errors_and_warnings(error.data);
            this.response.status = this.saved_status;
            });
        
        this.messagesEnabled = true;
    }
    
    basicDiscard() {
    	this.staff = jQuery.extend(true, {}, this.staffOriginal);
    	this.processBasicData();
    }
    
    addProject() {
    	this.$uibModal.open({
            bindToController: true,
            controller: AddProjectModalController,
            controllerAs: 'vm',
            resolve: {
                staff: () => this.staff,
                projects: () => this.projects,
                coordinator: () => this.coordinator,
                session: () => this.session
            },
            size: 'lg',
            templateUrl: AddProjectModalTemplate,
        }).result.then(() => {
        });
    }
    
    removeProject(project) {
		for (let worksOnIdx in this.staff.staffproject_set) {
			if (this.staff.staffproject_set[worksOnIdx].border_station === project.border_station) {
				this.staff.staffproject_set.splice(worksOnIdx, 1);
			}
		}
	}
	
	deleteStaff() {
		let dateData = new DateData();
		this.staff.last_date = dateData.dateToString(this.lastDate);
		this.basicSave();
	}
    
    
    /*
     * Contract tab methods
    */
    getStaffContract() {
    	this.service.getAttachments(this.staff).then((response) => {
    		this.attachments = response.data.results;
    		this.processStaffContract();
    	}, () => {
    		this.toastr.error("Failed to retrieve attachments");
    	});
    }
    
    processStaffContract() {
		this.setContractProject();
		for (let idx in this.attachments) {
		    this.attachments[idx].isModified = false;
		    this.attachments[idx].isRemoved = false;
		    this.attachments[idx].isNew = false;
		}
    }
    
    setContractProject() {
    	this.contractProject = {
    		labels:['Total', 'Gross Pay', 'Deductions'],
    		twelveMonth:{},
    		months: [],
    		currentIndex:0,
    		currencyType:'local',
    	};
    	
    	for (let countryIndex in this.countries) {
    		if (this.countries[countryIndex].id + '' === this.staff.country) {
    			this.currency = decodeURI(this.countries[countryIndex].currency);
    			if (this.countries[countryIndex].options.hasOwnProperty('drop_decimal')) {
            		this.dropDecimal = this.countries[countryIndex].options.drop_decimal;
            	}
    		}
    	}
    	
		this.getMonthlyRequests(0);
    }
    
    getMonthlyRequests(idx) {
    	let year = this.lastYear;
    	let month = this.lastMonth - idx;
    	while(month <= 0) {
    		month += 12;
    		year -= 1;
    	}
    	
    	this.spinner.show('Loading Salary');
    	this.service.getContractRequests(this.staff, year, month).then((response) => {
    		if (this.requestCount < 1) {
    			this.spinner.hide();
    		}
    		let result = {
    			month: parseInt(response.data.month),
    			year: parseInt(response.data.year),
    			Total:{local:0,USD:0}
    		};
    		for (let requestIndex in response.data.project_request) {
    			let request = response.data.project_request[requestIndex];
    			if (request.benefit_type_name.toLowerCase() === 'deductions') {
    				if (!result.hasOwnProperty('Deductions')) {
    					result.Deductions = {local:0};
    				}
    				result.Deductions.local += this.strToPennies(request.cost);
    				result.Total.local -= this.strToPennies(request.cost);
    			} else if (request.benefit_type_name.toLowerCase() === 'salary') {
    				if (!result.hasOwnProperty('Gross Pay')) {
    					result['Gross Pay'] = {local:0};
    				}
    				result['Gross Pay'].local += this.strToPennies(request.cost);
    				result.Total.local += this.strToPennies(request.cost);
    				
    			} else {
    				if (!result.hasOwnProperty(request.benefit_type_name)) {
    					result[request.benefit_type_name] = {local:0};
    					if (this.contractProject.labels.indexOf(request.benefit_type_name) < 0) {
    						this.contractProject.labels.push(request.benefit_type_name);
    					}
    				}
    				result[request.benefit_type_name].local += this.strToPennies(request.cost);
    				result.Total.local += this.strToPennies(request.cost);
    			}
    		}
    		for (let item in result) {
    			if (item !== 'month' && item !== 'year') {
    				result[item].USD = Math.floor(result[item].local / response.data.exchange_rate + 0.05);
    			}
    		}
    		this.contractProject.months.push(result);
    		if (this.contractProject.months.length <= 12) {
    			for (let item in result) {
    				if (item !== 'month' && item !== 'year') {
	    				if (this.contractProject.twelveMonth.hasOwnProperty(item)) {
	    					this.contractProject.twelveMonth[item].local += result[item].local;
	    					this.contractProject.twelveMonth[item].USD += result[item].USD;
	    				} else {
	    					this.contractProject.twelveMonth[item]= {local:result[item].local,USD:result[item].USD};
	    				}
    				}
    			}
    		}
    		if (this.contractProject.months.length < 12) {
    			this.getMonthlyRequests(this.contractProject.months.length);
    		}
    	}, (error) => {
    		this.spinner.hide();
    		this.toastr.error("Failed to load salary information year=" + year + " month=" + month);
    	});
    }
    
    getContractMonthHeader(monthIndex) {
    	let result = '';
    	let months = ['','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    	if (this.contractProject) {
	   		let theIndex = this.contractProject.currentIndex + monthIndex;
	   		if (this.contractProject.months.length > theIndex) {
	   			result = months[this.contractProject.months[theIndex].month] + " '" + (this.contractProject.months[theIndex].year - 2000);
	   		}
	   	}
	   	return result;
    }
    
    getContractMonthData(category, monthIndex) {
    	let result = '';
    	if (this.contractProject) {
	    	let theIndex = this.contractProject.currentIndex + monthIndex;
	    	if (this.contractProject.months.length > theIndex &&
	    			this.contractProject.months[theIndex].hasOwnProperty(category)) {
	    		return this.formatAmount(this.contractProject.months[theIndex][category]);
	    	}
    	}
    	return result;
    }
    
    formatAmount(amt) {
    	let currency = "$";
    	if (this.contractProject.currencyType === 'local') {
    		currency = this.currency;
    	}
    	return currency + this.penniesToStr(amt[this.contractProject.currencyType]);
    }
    
    contractScrollLeft() {
    	if (this.contractProject.currentIndex > 0) {
    		this.contractProject.currentIndex -= 1;
    	}
    }
    
    contractScrollRight() {
    	this.contractProject.currentIndex += 1;
    	if (this.contractProject.currentIndex + 7 >= this.contractProject.months.length) {
    		this.getMonthlyRequests(this.contractProject.currentIndex + 7);
    	}
    }
    
    cantractExpirationColor(value) {
        let color = "";
        if (value) {
            let current = new Date();
            let expiration = new Date(value);
            let diff = expiration - current;
            if (diff < 30) {
                color = 'expirationWarn';
            }
        }
        return color;
    }
    
    addAttachment() {
        let card = {
            id:null,
            staff:this.staff.id,
            attachment:null,
            option:null,
            attach_date:null,
            expiration_date:null,
            description:'',
            isNew:true,
            isRemoved:false,
            isModified:true,
        };
        this.openAttachment(card, null, true);
    }
    
    openAttachment(theCard, cardIndex, isAdd) {
        let modalActions = [];
        this.$uibModal.open({
            bindToController: true,
            controller: AddAttachmentModalController,
            controllerAs: 'vm',
            resolve: {
                isAdd: () => isAdd,
                card: () => theCard,
                isViewing: () => this.contractView,
                modalActions: () => modalActions,
                parentController: () => this
            },
            size: 'lg',
            templateUrl: AddAttachmentModalTemplate,
        }).result.then(() => {
            if (modalActions.indexOf('removeCard') > -1 && cardIndex !== null) {
                if (this.attachments[cardIndex].isNew) {
                    this.attachments.splice(cardIndex,1);
                } else {
                    this.attachments[cardIndex].isRemoved = true;
                }
            } else {
                if (isAdd) {
                    this.attachments.push(theCard);
                } else {
                    theCard.isModified = true;
                }
            }
        });
    }
    
    contractModified() {
        for (let idx in this.attachments) {
            if (this.attachments[idx].isNew || this.attachments[idx].isModified || this.attachments[idx].isRemoved) {
                return true;
            }
        }
    
    	return false;
    }
    
    contractSave() {
        this.spinner.show('Saving contract information');
        for (let idx in this.attachments) {
            if (this.attachments[idx].isRemoved) {
                this.attachmentDelete(this.attachments[idx]);
            } else if (this.attachments[idx].isNew || this.attachments[idx].isModified) {
                this.attachmentSave(this.attachments[idx]);
            }
        }
    }
    
    attachmentSave(card) {
        this.requestCount += 1;
        this.service.saveAttachment(this.staff, card).then (() => {
            this.requestCount -= 1;
            if (this.requestCount < 1) {
                this.requestCount = 0;
                this.getStaffContract();
            }
        }, () => {
            this.toastr.error("Failed to save contract information");
            this.requestCount -= 1;
            if (this.requestCount < 1) {
                this.requestCount = 0;
                this.getStaffContract();
            }});
    }
    
    attachmentDelete(card) {
        this.requestCount += 1;
        this.service.deleteAttachment(card).then (() => {
            this.requestCount -= 1;
            if (this.requestCount < 1) {
                this.requestCount = 0;
                this.getStaffContract();
            }
        }, () => {
            this.toastr.error("Failed to delete contract information");
            this.requestCount -= 1;
            if (this.requestCount < 1) {
                this.requestCount = 0;
                this.getStaffContract();
            }});
    }
    
    contractDiscard() {
    	this.contract = jQuery.extend(true, {}, this.originalContract);
    	this.processStaffContract();
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
        if (isNaN(pennies)) {
        	pennies = 0;
        }
        
        return pennies;
    }
    
     penniesToStr(pennies, exchange_rate=null) {
    	let value = pennies;
    	if (exchange_rate !== null) {
    		value = Math.round(value / exchange_rate);
    	}
        let dollars = Math.floor(value / 100);
        let cents = value - dollars * 100;
        let str = '';
        if (!this.dropDecimal || cents !== 0 || this.currencyType === 'USD') {
	        str = cents + '';
	        if (cents < 10) {
	            str = '0' + str;
	        }
	        str = dollars + '.' + str;
        } else {
        	str = dollars + '';
        }
        return str;
    }
    
    isString(val) {
    	return typeof val === 'string';
    }
    
    getScannedFormUrl(url) {
        let theUrl = new URL(url);
        let theHref = theUrl.href;
        return theHref;
    }
    
    
	/*
     * Knowledge tab methods
    */
    getStaffKnowledge() {
    	this.service.getStaffKnowledge(this.stateParams.id).then((response) => {
    		this.knowledge = response.data;
    		this.processStaffKnowledge();
    	});
    }
    
    processStaffKnowledge() {
    	let dateData = new DateData();
		for (let itemIndex in this.knowledgeDates.items) {
			let item = this.knowledgeDates.items[itemIndex];
			if (this.knowledge[item] !== null) {
				this.knowledgeDates[item] = dateData.dateAsUTC(this.knowledge[item]);
			} else {
				this.knowledgeDates[item] = null;
			}
		}
		this.updateCoordinatorOptions();
		this.originalKnowledge = jQuery.extend(true, {}, this.knowledge);
    }
    
    knowledgePreSave() {
    	let dateData = new DateData();
    	for (let itemIndex in this.knowledgeDates.items) {
    		let item = this.knowledgeDates.items[itemIndex];
    		if (this.knowledgeDates[item] !== null) {
    			this.knowledge[item] = dateData.dateToString(this.knowledgeDates[item]);
    		} else {
    			this.knowledge[item] = null;
    		}
    	}
    }
    
    knowledgeModified() {
    	this.knowledgePreSave();
    	for (let item in this.knowledge) {
    		if (this.knowledge[item] !== this.originalKnowledge[item]) {
    			return true;
    		}
    	}
    	return false;
    }
    
    knowledgeSave() {
    	this.knowledgePreSave();
    	this.spinner.show("Saving Knowledge..."); 
    	this.service.saveStaffKnowledge(this.staff, this.knowledge).then((response) => {
    		this.knowledge = response.data;
    		this.processStaffKnowledge();
    		if (this.requestCount < 1) {
    			this.spinner.hide();
    		}
    	}, () => {
    		this.spinner.hide();
    		this.toastr.error("Failed to save knowledge information");
    	});
    }
    
    knowledgeDiscard() {
    	this.knowledge = jQuery.extend(true, {}, this.originalKnowledge);
    	this.processStaffKnowledge();
    }
    
    knowledgeClass(item) {
		if (this.staff) {
	    	let roles = this.knowledgeMap[item];
	    	if (roles === null) {
	    		 if (this.knowledgeDates[item] === null) {
	    		 	return 'knowledgeMissing';
	    		 }
	    	} else {
	    		for (let roleIndex in roles) {
	    			for (let projectIndex in this.staff.staffproject_set) {
	    				if (this.staff.staffproject_set[projectIndex].coordinator.indexOf(roles[roleIndex]) >= 0) {
	    					if (this.knowledgeDates[item] === null) {
				    		 	return 'knowledgeMissing';
				    		} else {
				    			return 'knowledgeGood';
				    		}
	    				}
	    			}
	    		}
	    	}
    	}
    	return '';
    }
    
    
    /*
     * Review tab methods
    */
    getStaffReviews() {
    	this.service.getStaffReviewList(this.staff.id).then((response) => {
    		this.reviews = response.data.results;
    		this.processStaffReviews();
    		if (this.requestCount < 1) {
    			this.spinner.hide();
    		}
    	});
    }
    
    processStaffReviews() {
    	this.originalReviews = [];
    	for (let reviewIndex in this.reviews) {
    		this.originalReviews.push(jQuery.extend(true, {}, this.reviews[reviewIndex]));
    	}
    }
    
    addReview() {
    	this.finishReviewEdit();
    	this.reviewDate = null;
    	let newReview = {
    		id:null,
    		staff:this.staff.id,
    		reviewDate:null,
    		networking:null,
    		compliance:null,
    		dependability:null,
    		alertness:null,
    		boldness:null,
    		questioning:null,
    		teamwork:null,
    		total:0,
    		inProgress:true,
    		modified:true
    	};
    	this.reviews.push(newReview);
    }
    
    modifyReview(review) {
    	this.finishReviewEdit();
    	review.inProgress = true;
    	review.modified = true;
    	if (review.review_date === null) {
    		this.reviewDate = null;
    	} else {
    		let dateData = new DateData();
    		this.reviewDate = dateData.dateAsUTC(review.review_date);
    	}
    }
    
    deleteReview(index) {
    	if (index < this.reviews.length) {
	    	if (this.reviews[index].id !== null) {
		    	this.reviews[index].toDelete = true;
		    	this.reviews[index].modified = true;
	    	} else {
	    		this.reviews.splice(index, 1);
	    	}
	    }
    }
    
    finishReviewEdit() {
    	for (let reviewIndex in this.reviews) {
    		if (this.reviews[reviewIndex].inProgress) {
    			if (this.reviewDate === null) {
    				this.reviews[reviewIndex].review_date = null;
    			} else {
    				let dateData = new DateData();
    				this.reviews[reviewIndex].review_date = dateData.dateToString(this.reviewDate);
    				this.reviews[reviewIndex].inProgress = false;
    			}
    		}
    	}
    }
    
    reviewTotal(review) {
    	let newTotal = 0;
    	for (let item in review) {
    		if (reviewMertrics.indexOf(item) < 0) {
    			continue;
    		}
    		if (review[item] !== null) {
    			newTotal += review[item];
    		}
    	}
    	
    	review.total = newTotal;
    }
    
    reviewInProgressReady() {
    	let inProgressReady = true;
    	for (let reviewIndex in this.reviews) {
    		if (this.reviews[reviewIndex].inProgress) {
    			if (this.reviewDate === null) {
    				inProgressReady = false;
    				break;
    			}
    			for (let item in this.reviews[reviewIndex]) {
    				if (reviewMertrics.indexOf(item) < 0) {
    					continue;
    				}
    				if (this.reviews[reviewIndex][item] === null || isNaN(this.reviews[reviewIndex][item]))
    				{
    					inProgressReady = false;
    					break;
    				}
    				
    				let value = parseFloat(this.reviews[reviewIndex][item]);
    				if (value < 1.0 || value > 5.0) {
    					inProgressReady = false;
    					break;
    				}
    			}
    		}
    	}
    	
    	return inProgressReady;
    }
    
    reviewsReadyToSave() {
    	let inProgressReady = this.reviewInProgressReady();
    	let modifiedReviews = this.reviews && this.reviews.length === 0;
    	
    	for (let reviewIndex in this.reviews) {
    		if (this.reviews[reviewIndex].modified) {
    			modifiedReviews = true;
    		}
    	}
    	
    	return inProgressReady && modifiedReviews;
    }
    
    reviewsModified() {
    	for (let reviewIndex in this.reviews) {
    		if (this.reviews[reviewIndex].modified) {
    			return true;
    		}
    	}
    	return false;
    }
    
    reviewsSave() {
    	this.finishReviewEdit();
    	this.requestCount = 0;
    	this.spinner.show("Saving Reviews..."); 
    	for (let reviewIndex in this.reviews) {
    		if (this.reviews[reviewIndex].modified) {
    			this.requestCount++;
    			if (this.reviews[reviewIndex].toDelete) {
    				this.service.deleteStaffReview(this.reviews[reviewIndex]).then(() => {
    					this.requestCount--;
    					if (this.requestCount <= 0) {
    						this.requestCount = 0;
    						this.getStaffReviews();
    					}
    				}, () => {
    					this.requestCount--;
    					this.toastr.error("Failed to delete review");
    					if (this.requestCount <= 0) {
    						this.requestCount = 0;
    						this.getStaffReviews();
    					}
    				});
    			} else {
    				this.service.submitStaffReview(this.reviews[reviewIndex]).then(() => {
    					this.requestCount--;
    					if (this.requestCount <= 0) {
    						this.requestCount = 0;
    						this.getStaffReviews();
    					}
    				}, () => {
    					this.toastr.error("Failed to save review");
    					this.requestCount--;
    					if (this.requestCount <= 0) {
    						this.requestCount = 0;
    						this.getStaffReviews();
    					}
    				});
    			}
    		}
    	}
    }
    
    reviewsDiscard() {
    	this.reviews = [];
    	for (let reviewIndex in this.originalReviews) {
    		this.reviews.push(jQuery.extend(true, {}, this.originalReviews[reviewIndex]));
    	}
    }
    
    reviewColor(value) {
    	let color = "reviewInvalid";
    	if (value!==null && value!== '') {
    		if (!isNaN(value)) {
    			let numValue = parseFloat(value);
    			if (numValue >= 1.0 && numValue <= 5.0) {
    				color = "reviewValid";
    			}
    		}
    	}
    	return color;
    }
}
