import './subcommitteeList.less';

export default class SubcommitteeListController {
    constructor(SubcommitteeService, SessionService, SpinnerOverlayService, StickyHeader, $state, $stateParams, $timeout,  toastr, constants, moment) {
        'ngInject';
        this.service = SubcommitteeService;
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
        this.subcommitteeList = [];
        this.hasAddPermission = false;
        
        this.timer = {};
        this.nextPage = "";
        this.queryParameters = {
            "page_size": 15,
            "reverse": false,
            "ordering": 'first_name,last_name',
            "search": '',
            "country_ids": '',
            "project_id": '',
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

        let tmp = sessionStorage.getItem('subcommitteeList-search');
        if (tmp !== null) {
            this.queryParameters.search = tmp;
        }
        tmp = sessionStorage.getItem('subcommitteeList-country_ids');
        if (tmp !== null) {
            this.queryParameters.country_ids = tmp;
        }

        this.getUserCountries();
        this.getUserProjects();
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

    searchSubcommittee() {
        if (this.timer.hasOwnProperty('$$timeoutId')) {
            this.timeout.cancel(this.timer);
        }
        sessionStorage.setItem('subcommitteeList-search', this.queryParameters.search);
        sessionStorage.setItem('subcommitteeList-country_ids', this.queryParameters.country_ids);
        sessionStorage.setItem('subcommitteeList-project_id', this.queryParameters.project_id);
        this.timer = this.timeout( () => {
            this.getSubcommitteeList(1);
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
        ctrl.searchSubcommittee();
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
        this.getSubcommitteeList();
    }
    
    getUserProjects() {
    	this.spinnerOverlayService.show("Searching for Subcommittee..."); 
        this.service.getUserStations(this.session.user.id).then((response) => {
           	this.projects = [];
           	for (let idx in response.data) {
           		let project = response.data[idx];
           		if (project.features.indexOf('hasSubcommittee') >= 0) {
           			this.projects.push(project);
           		}
           	}
           	let tmp = sessionStorage.getItem('subcommitteeList-project_id');
	        if (tmp !== null && this.countryDropDown.selectedOptions.length > 0) {
	        	for (let idx in this.projects) {
	        		if (this.projects[idx].id + '' === tmp && this.projects[idx].operating_country === this.countryDropDown.selectedOptions[0].id) {
	        			this.queryParameters.project_id = tmp;
	        		}
	        	}
	        }
           	this.getSubcommitteeList();
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
                if (this.session.checkPermission('SUBCOMMITTEE','ADD',this.countries[idx].id, null) === true) {
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
    
    addUrls(subcommitteeList) {
        for (let idx=0; idx < subcommitteeList.length; idx++) {
            let subcommittee = subcommitteeList[idx];
            subcommittee.viewUrl = this.state.href('subcommittee', {id:subcommittee.id, isViewing:true});
            subcommittee.editUrl = this.state.href('subcommittee', {id:subcommittee.id, isViewing:false });
        }
    }

    getSubcommitteeList() {
        this.showPage(1);
    }
    
    showPage(pageNumber) {
        this.spinnerOverlayService.show("Searching for Subcommittee...");        
        this.service.getSubcommitteeList(this.transform(this.queryParameters, pageNumber)).then( (promise) => {
            this.subcommitteeList = promise.data.results;
            this.paginate.items = promise.data.count;
            this.paginate.currentPage = pageNumber;
            this.spinnerOverlayService.hide();
            this.addUrls(this.subcommitteeList);
        }, () => {
        	this.spinnerOverlayService.hide();
        });
    }
}
