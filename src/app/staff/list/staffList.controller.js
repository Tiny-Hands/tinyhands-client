/* global angular */
import basicTemplate from './basicList.html';
import contractTemplate from './contractList.html';
import knowledgeTemplate from './knowledgeList.html';
import reviewTemplate from './reviewList.html';
import './staffList.less';

const months = ["", "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ", "Sep ", "Oct ", "Nov ", "Dec "];

export default class StaffListController {
    constructor(StaffService, SessionService, SpinnerOverlayService, StickyHeader, $state, $stateParams, $timeout,  toastr, constants, moment) {
        'ngInject';
        this.service = StaffService;
        this.session = SessionService;
        this.stateParams = $stateParams;
        this.sticky = StickyHeader;
        this.spinnerOverlayService = SpinnerOverlayService;
        this.state = $state;
        this.timeout = $timeout;
        this.toastr = toastr;
        this.constants = constants;
        this.moment = moment;
        this.countries = [];
        this.projects = [];
        this.staffList = [];
        this.holdList = [];
        this.hasAddPermission = false;
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
        this.digits1Format = {'minimumFractionDigits': 1, 'maximumFractionDigits': 1};
        this.digits2Format = {'minimumFractionDigits': 2, 'maximumFractionDigits': 2};
        this.digitsMinFormat = {'minimumFractionDigits': 0, 'maximumFractionDigits': 2};
        this.currency = 'local';

        this.timer = {};
        this.nextPage = "";
        this.queryParameters = {
            "page_size": 15,
            "reverse": false,
            "ordering": 'first_name,last_name',
            "search": '',
            "country_ids": '',
            "project_id": '',
            "include":''
        };
        this.stickyOptions = this.sticky.stickyOptions;
        this.stickyOptions.zIndex = 1;
        this.projectCategoryOptions = [];
        
        this.paginate = {
                items:0,
                pageSize:this.queryParameters.page_size,
                currentPage:1,
            };
        this.countryDropDown = {};
        this.countryDropDown.options = [];
        this.countryDropDown.selectedOptions = [];
        this.countryDropDown.settings = {smartButtonMaxItems:2, showCheckAll: false, showUncheckAll: false, selectionLimit:1,};
        this.countryDropDown.customText = {buttonDefaultText: 'All'};
        this.countryDropDown.eventListener = {
            onItemSelect: this.countryChange,
            onItemDeselect: this.countryChange,
            onSelectAll: this.countryChange,
            onDeselectAll: this.countryChange,
            ctrl: this   
        };

        let tmp = sessionStorage.getItem('staffList-search');
        if (tmp !== null) {
            this.queryParameters.search = tmp;
        }
        tmp = sessionStorage.getItem('staffList-country_ids');
        if (tmp !== null) {
            this.queryParameters.country_ids = tmp;
        }
        
        this.selectedStep = 0;
        this.stepTemplates = [
        	{template:basicTemplate, name:"Basic"},
        ];
        
   		if (this.session.checkPermission('STAFF','VIEW_CONTRACT',null, null) === true) {
   			this.stepTemplates.push({template:contractTemplate, name:"Contract"});
   			this.queryParameters.include += 'VIEW_CONTRACT';
   			
   		}
   		this.stepTemplates.push({template:knowledgeTemplate, name:"Knowledge"});
   		if (this.session.checkPermission('STAFF','VIEW_REVIEW',null, null) === true) {
   			this.stepTemplates.push({template:reviewTemplate, name:"Reviews"});
   			this.queryParameters.include += 'VIEW_REVIEW';
   		}

        this.getUserCountries();
        this.getUserProjects();
        //this.getStaffList();
    }
    
    knowledgeClass(staff, item) {
    	let roles = this.knowledgeMap[item];
    	if (roles === null) {
    		 if (staff.knowledge_data[item] === null) {
    		 	return 'knowledgeMissing';
    		 }
    	} else {
    		for (let roleIndex in roles) {
    			if (staff.coordinatorRoles.indexOf(roles[roleIndex]) >= 0) {
    				if (staff.knowledge_data[item] === null) {
		    		 	return 'knowledgeMissing';
		    		} else {
		    			return 'knowledgeGood';
		    		}
    			}
    		}
    	}
    	return '';
    }
    
    contractExpirationClass(value) {
        let color = "";
        if (value) {
            let current = new Date();
            let expiration = new Date(value);
            let diff = (expiration - current)/(1000 * 60 * 60 * 24);
            if (diff < 30) {
                color = 'expirationWarn';
            }
        }
        return color;
    }
    
    monthYearString(dt) {
    	let result = '';
    	if (dt !== null) {
    		let parts = dt.split('-');
    		result = months[parseInt(parts[1])] + "'" + parts[0].substring(2);
    	}
    	return result;
    }
    monthDayString(dt) {
    	let result = '';
    	if (dt !== null) {
    		let parts = dt.split('-');
    		result = months[parseInt(parts[1])] + parts[2];
    	}
    	return result;
    }

    transform(queryParams, pageNumber) {
        var queryParameters = angular.copy(queryParams);
        if (queryParameters.reverse) {
            queryParameters.ordering = '-' + queryParameters.ordering;
        }
        queryParameters.page = pageNumber;
        delete queryParameters.reverse;
        var params = [];
        Object.keys(queryParameters).forEach( (name) => {
            if (queryParameters[name] !== null && queryParameters[name] !== '') {
                params.push({"name": name, "value": queryParameters[name]});
            }
        });
        return params;
    }

    searchStaff() {
        if (this.timer.hasOwnProperty('$$timeoutId')) {
            this.timeout.cancel(this.timer);
        }
        sessionStorage.setItem('staffList-search', this.queryParameters.search);
        sessionStorage.setItem('staffList-country_ids', this.queryParameters.country_ids);
        sessionStorage.setItem('staffList-project_id', this.queryParameters.project_id);
        this.timer = this.timeout( () => {
            this.getStaffList(1);
        }, 500);
    }
    
    countryChange() {
        var selectedCountries = '';
        var sep = '';
        var ctrl = this.ctrl;
        for (var idx=0; idx < ctrl.countryDropDown.selectedOptions.length; idx++) {
            selectedCountries = selectedCountries + sep + ctrl.countryDropDown.selectedOptions[idx].id;
            sep = ',';
        }
        ctrl.queryParameters.country_ids = selectedCountries;
        ctrl.queryParameters.project_id = '';
        ctrl.searchStaff();
    }
    
    
    getSortIcon(column, reverse) {
        if(reverse === 'reverse'){
            return (column === this.queryParameters.ordering) && this.queryParameters.reverse;
        }
        return (column === this.queryParameters.ordering) && !this.queryParameters.reverse;
    }

    updateSort(column) {
        if (column === this.queryParameters.ordering) {
            this.queryParameters.reverse = ! this.queryParameters.reverse;
        } else {
        	this.queryParameters.reverse = false;
        }
        this.queryParameters.ordering = column;
        this.getStaffList();
    }
    
    displayCurrency(staff) {
    	if (this.currency === 'USD') {
    		return '$ ';
    	}
    	return decodeURI(this.countryById[staff.country].currency);
    }
    
    displayCurrencyFormat(staff) {
    	let format = this.digits2Format;
    	let dropDecimal = false;
    	if (this.countryById[staff.country].options!==null &&
    			this.countryById[staff.country].options.hasOwnProperty('drop_decimal') &&
    			this.currency !== 'USD') {
    		dropDecimal = this.countryById[staff.country].options.drop_decimal;
    		
    	}
    	if (dropDecimal) {
    		format = this.digitsMinFormat;
    	} 
    	return format;	
    }
    
    getUserProjects() {
    	this.spinnerOverlayService.show("Searching for Staff..."); 
        this.service.getUserStations(this.session.user.id).then((response) => {
           	this.projects = response.data;
           	let tmp = sessionStorage.getItem('staffList-project_id');
	        if (tmp !== null && this.countryDropDown.selectedOptions.length > 0) {
	        	for (let idx in this.projects) {
	        		if (this.projects[idx].id + '' === tmp && this.projects[idx].operating_country === this.countryDropDown.selectedOptions[0].id) {
	        			this.queryParameters.project_id = tmp;
	        		}
	        	}
	        }
           	this.getStaffList();
        }, () => {
        	this.spinnerOverlayService.hide();
        });
    }
    
    getUserCountries() {
        this.service.getUserCountries(this.session.user.id).then((promise) => {
            this.countries = promise.data;
            this.countryById = _.keyBy(this.countries, (x) => x.id);
            this.countryDropDown.options = [];
            for (var idx=0; idx < this.countries.length; idx++) {
                this.countryDropDown.options.push({id: this.countries[idx].id, label: this.countries[idx].name});
                if (this.session.checkPermission('STAFF','ADD',this.countries[idx].id, null) === true) {
                	this.hasAddPermission = true;
                }
            }
            
            if (this.queryParameters.country_ids.length > 0) {
                let country_array = this.queryParameters.country_ids.split(',');
                for (let idx=0; idx < country_array.length; idx++) {
                    let country_id = Number(country_array[idx]);
                    for (let idx1=0; idx1 < this.countries.length; idx1++) {
                        if (this.countries[idx1].id === country_id) {
                            this.countryDropDown.selectedOptions.push(this.countryDropDown.options[idx1]);
                        }
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
    
    addUrls(staffList) {
        for (let idx=0; idx < staffList.length; idx++) {
            let staff = staffList[idx];
            staff.viewUrl = this.state.href('staff', {id:staff.id, isViewing:true});
            staff.editUrl = this.state.href('staff', {id:staff.id, isViewing:false });
        }
    }
    
    projectText(staffList) {
    	for (let idx=0; idx < staffList.length; idx++) {
            let staff = staffList[idx];
            staff.projectText = '';
            staff.coordinatorRoles = '';
            let sep = '';
            let coordinatorSep = '';
            for (let staffProjIdx in staff.staffproject_set) { 
            	staff.projectText += sep + staff.staffproject_set[staffProjIdx].project_code;
            	sep = '/';
            	if (staff.staffproject_set[staffProjIdx].coordinator) {
            		staff.coordinatorRoles += coordinatorSep + staff.staffproject_set[staffProjIdx].coordinator.replace(';','/');
            		coordinatorSep = '/';
            	}
            }
        }
    }

    getStaffList() {
        this.showPage(1);
    }
    
    showPage(pageNumber) {
        this.spinnerOverlayService.show("Searching for Staff...");        
        this.service.getStaffList(this.transform(this.queryParameters, pageNumber)).then( (promise) => {
            this.staffList = promise.data.results;
            this.projectText(this.staffList);
            this.paginate.items = promise.data.count;
            this.paginate.currentPage = pageNumber;
            this.spinnerOverlayService.hide();
            this.addUrls(this.staffList);
        }, () => {
        	this.spinnerOverlayService.hide();
        });
    }
}
