/* global jQuery */
import './subcommittee.less';

import AddProjectModalTemplate from './addProjectModal.html';

class AddProjectModalController {
	constructor($uibModalInstance, subcommittee, projects, coordinator, session) {
	    'ngInject';
		this.$uibModalInstance = $uibModalInstance;
		this.subcommittee = subcommittee;
		this.projects = projects;
		this.coordinator= coordinator;
		
		this.displayProjects = [];
		for (let projIdx in this.projects) {
			if (this.projects[projIdx].operating_country + '' !== this.subcommittee.country) {
				continue;
			}
			if (this.projects[projIdx].features.indexOf('hasSubcommittee') < 0) {
				continue;
			}
			if (!session.checkPermission('SUBCOMMITTEE','EDIT_BASIC', this.projects[projIdx].operating_country,this.projects[projIdx].id)) {
				continue;
			}
			let found = false;
			for (let subcommitteeIdx in this.member_projects) {
				if (this.projects[projIdx].id === this.subcommittee.member_projects[subcommitteeIdx]) {
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
				this.subcommittee.member_projects.push(this.displayProjects[projIdx].project.id);
			}
		}
		this.$uibModalInstance.close();
	}

	cancel() {
		this.$uibModalInstance.dismiss();
	}
}

export default class SubcommitteeController {
    constructor($uibModal, constants, SubcommitteeService, $stateParams, $state, SpinnerOverlayService, $uibModalStack, SessionService, toastr) {
        'ngInject';
        
        this.stateParams = $stateParams;
        this.modalStack = $uibModalStack;
        this.$uibModal = $uibModal;
        this.constants = constants;
        this.service = SubcommitteeService;
        this.state = $state;
        this.spinner = SpinnerOverlayService;
        this.relatedUrl = null;
        this.session = SessionService;
        this.toastr = toastr;
        this.isViewing = this.stateParams.isViewing === 'true';
        this.subcommittee = null;
        this.projectsById=[];
        this.countries = [];
        this.basicView = true;
        this.basicEdit = false;
        this.contractView = false;
        this.contractEdit = false;
        this.isRemove = false;
        this.requestCount = 0;
        
        this.getUserCountries();
        this.getUserProjects();
    }
    
    getUserProjects() {
    	this.spinner.show("Get Subcommittee Member...");
    	this.getAllProjects();
        this.service.getUserStations(this.session.user.id).then((response) => {
           	this.projects = response.data;
           	this.getSubcommittee();
           	
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
           		if (this.session.checkPermission('SUBCOMMITTEE','VIEW_BASIC',response.data[countryIndex].id, null) === true) {
           			this.countries.push(response.data[countryIndex]);
           		}
           	}
        });
    }
    
    checkAnyPermission(projectList, permission) {
    	let result = this.session.checkPermission('SUBCOMMITTEE',permission, this.subcommittee.country, null);
    	if (!result) {
	    	for (let projIdx in projectList) {
	    		if (this.session.checkPermission('SUBCOMMITTEE',permission,projectList[projIdx].country_id, projectList[projIdx].border_station) === true) {
	    			result = true;
	    			break;
	    		}
	    	}
    	}
    	
    	return result;
    }
    
    checkForPermission(projectList, permission) {
    	let result = this.session.checkPermission('SUBCOMMITTEE',permission, this.subcommittee.country, null);
    	if (!result) {
	    	for (let projIdx in projectList) {
	    		if (this.session.checkPermission('SUBCOMMITTEE',permission,projectList[projIdx].country_id, projectList[projIdx].border_station) === true) {
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
    getSubcommittee() {
    	this.requestCount++;
        this.service.getSubcommittee(this.stateParams.id).then((response) => {
        	this.requestCount--;
            this.subcommittee = response.data;
            this.basicEdit = this.checkForPermission('SUBCOMMITTEE', 'EDIT_BASIC', this.subcommittee.country, null) || this.subcommittee.id === null;
            this.contractView = this.checkForPermission('SUBCOMMITTEE', 'VIEW_CONTRACT', this.subcommittee.country, null);
            this.contractEdit = this.checkForPermission('SUBCOMMITTEE', 'EDIT_CONTRACT', this.subcommittee.country, null);
            this.canDelete = this.checkForPermission('SUBCOMMITTEE', 'DELETE', this.subcommittee.country, null);
            this.subcommittee.country += '';
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
    
    submit() {
    	this.spinner.show("Saving Subcommittee Member"); 
        this.service.submitSubcommittee(this.subcommittee).then((response) => {
             this.state.go('subcommitteeList');
         }, (error) => {
         	this.spinner.hide();
         	this.toastr.error("Failed to save member information");
            this.set_errors_and_warnings(error.data);
            this.response.status = this.saved_status;
            });
        
        this.messagesEnabled = true;
    }
    
    addProject() {
    	this.$uibModal.open({
            bindToController: true,
            controller: AddProjectModalController,
            controllerAs: 'vm',
            resolve: {
                subcommittee: () => this.subcommittee,
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
		for (let worksOnIdx in this.subcommittee.member_projects) {
			if (this.subcommittee.member_projects[worksOnIdx] === project) {
				this.subcommittee.member_projects.splice(worksOnIdx, 1);
			}
		}
	}
	
	deleteMember() {
		this.service.deleteSubcommittee(this.subcommittee).then(() => {
			 this.state.go('subcommitteeList');
		}, () => {
			this.toastr.error("Failed to delete member");
		});
	}
    
    isString(val) {
    	return typeof val === 'string';
    }
    
    getScannedFormUrl(url) {
        let theUrl = new URL(url);
        let theHref = theUrl.href;
        return theHref;
    }
}
