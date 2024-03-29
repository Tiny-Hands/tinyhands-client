/* global jQuery */
import stationDetailModalTemplate from './stationDetailModal.html';
import './stationData.less';

class StationDetailModalController {
    constructor($uibModalInstance, $window, BaseService, stationDetail) {
        'ngInject';
        this.uibModalInstance = $uibModalInstance;
        this.window = $window;
        this.service = BaseService;
        this.stationDetail = stationDetail;
    }
    
    dismiss() {
        this.uibModalInstance.dismiss();
    }
}

class StationDataController {
    constructor($uibModal, $rootScope, SessionService, stationDataService, SpinnerOverlayService, StickyHeader, toastr) {
        'ngInject';
        
        this.modal = $uibModal;
        this.session = SessionService;
        this.service = stationDataService;
        this.spinner = SpinnerOverlayService;
        this.toastr = toastr;
        this.toastr.options.timeout = 5000;
        this.stickyOptions = StickyHeader.stickyOptions;
        this.stickyOptions.zIndex = 1;
        this.stickyOptions.top = 50;
        this.monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.digits2Format = {'minimumFractionDigits': 0, 'maximumFractionDigits': 2};
        
        this.countries = [];
        this.projectCategories = null;
        this.stations = null;
        this.sortedStations = null;
        this.stationData = [null, null, null];
        this.stationDisplayData = [null, null, null];
        this.exchangeData = [null, null, null];
        this.exchangeDisplayData = [null, null, null];
        this.saveCount = 0;
        this.editAll = this.session.checkPermission('PROJECT_STATISTICS','EDIT_ALL',null, null);
        
        this.setCurrentMonth();
        
        let tmp = sessionStorage.getItem('station-stats-country');
        if (!tmp) {
            let tmp = window.localStorage.getItem('dashboard-country');
            if (tmp) {
                sessionStorage.setItem('station-stats-country', tmp);
            }
        }
        
        this.getCategories();
        this.getCountries();
    }
    
    setCurrentMonth() {
        let today = new Date();
        this.month = today.getMonth();
        this.year = today.getFullYear();
        if (this.month < 1) {
            this.year -= 1;
            this.month = 12;
        }
        this.monthStr = '' + this.month;
        this.yearMonth = this.year * 100 + this.month;
        
        this.editYearMonth = [
            this.yearMonth,
            this.yearMonthOffset(this.yearMonth, 1)
        ];
        
        if (this.locations !== null) {
            this.reloadData();
        }
    }
    
    yearMonthOffset(start, offset) {
        let year = Math.floor(start/100);
        let month = start % 100;
        month += offset;
        while (month < 1) {
            year -= 1;
            month += 12;
        }
        while (month > 12) {
            year += 1;
            month -= 12;
        }
        return year * 100 + month;
    }
    
    contextMenu(e) {
        if (e.ctrlKey){
        }
    }
    
    getCategories() {
        this.service.getProjectCategories().then((promise) => {
            this.projectCategories = promise.data;
        });
        
        if (this.stations !== null && this.projectCategories !== null) {
            this.sortStations();
        }
    }
    
    getCountries() {
        let selectedCountryName = sessionStorage.getItem('station-stats-country');
        this.service.getUserCountries(this.session.user.id, 'PROJECT_STATISTICS', 'VIEW').then((promise) => {
            this.countries = promise.data;
            this.country = null;
            for (let idx=0; idx < this.countries.length; idx++) {
                if (this.countries[idx].name === selectedCountryName) {
                    this.country = '' + this.countries[idx].id;
                    break;
                }
            }
            
            this.countrySelect();
        });
    }
    
    countrySelect() {
        if (this.country) {
            this.stations = null;
            this.stationData = [{}, {}, {}];
            this.stationDisplayData = [{}, {}, {}];
            this.exchangeData = [{}, {}, {}];
            this.exchangeDisplayData = [{}, {}, {}];
            this.service.getUserStations(this.session.user.id, 'PROJECT_STATISTICS', 'VIEW', this.country).then ((promise) => {
                this.stations = promise.data;
                this.reloadData();
                if (this.stations !== null && this.projectCategories !== null) {
                    this.sortStations();
                }
            });
            for (let idx=0; idx < this.countries.length; idx++) {
                if (('' + this.countries[idx].id) === this.country) {
                    this.selectedCountry = this.countries[idx];
                    sessionStorage.setItem('station-stats-country', this.countries[idx].name);
                    break;
                }
            }
            this.isViewing = true;
            if (this.session.checkPermission('PROJECT_STATISTICS','EDIT',parseInt(this.country), null)) {
                this.isViewing = false;
            }
        } else {
            this.spinner.hide();
        }
    }
    
    sortStations() {
        this.sortedStations = [];
        for (let idx=0; idx < this.projectCategories.length; idx++) {
        	this.projectCategories[idx].present = false;
            for (let idx1=0; idx1 < this.stations.length; idx1++) {
                if (this.stations[idx1].project_category_name === this.projectCategories[idx].name) {
                	this.projectCategories[idx].present = true;
                    this.sortedStations.push(this.stations[idx1]);
                }
            }
        }
    }
    
    reloadData() {
        this.loadCount = 3;
        this.spinner.show('Loading station data...');
        this.getStationData(this.yearMonth, 0);
        this.getStationData(this.yearMonthOffset(this.yearMonth, -1), 1);
        this.getStationData(this.yearMonthOffset(this.yearMonth, -2), 2);
    }
    
    totalColumn(position) {
        for (let element in this.stationDisplayData[position].total) {
            this.stationDisplayData[position].total[element] = 0;
            for (let idx in this.stationDisplayData[position]) {
                if (idx !== 'total' && this.stationDisplayData[position][idx][element] &&
                        !isNaN(this.stationDisplayData[position][idx][element])) {
                    this.stationDisplayData[position].total[element] += (this.stationDisplayData[position][idx][element] * 1);
                }
            }
        }
       
    }
    
    getStationData(yearMonth, position) {
    	if (typeof this.country === "undefined" || this.country === null) {
    		return;
    	}
        this.service.getExchangeRate(this.country, yearMonth).then ((promise) => {
            this.exchangeData[position] = promise.data;
            this.exchangeDisplayData[position] = jQuery.extend(true, {}, this.exchangeData[position]);
        });
        this.service.getStationData(this.country, yearMonth).then((promise) => {
            this.stationData[position] = promise.data;
            let displayData = {};
            for (let idx=0; idx < this.stations.length; idx++) {
                displayData[this.stations[idx].id] = {
                    staff:null,
                    intercepts:null,
                    arrests:null,
                    gospel:null,
                    empowerment:null,
                    budget:null
                };
            }
            displayData.total = {
                    staff:0,
                    intercepts:0,
                    arrests:0,
                    gospel:0,
                    empowerment:0,
                    budget:0
            };
            for (let idx=0; idx < this.stationData[position].length; idx++) {
                displayData[this.stationData[position][idx].station] = jQuery.extend(true, {}, this.stationData[position][idx]);
            }
            this.stationDisplayData[position] = displayData;
            this.totalColumn(position);
            this.loadCount -= 1;
            if (this.loadCount < 1) {
                this.spinner.hide();
                this.editAll = this.session.checkPermission('PROJECT_STATISTICS','EDIT_ALL',null, null);
            }
        });
        
    }
    
    setMonth() {
        this.month = parseInt(this.monthStr);
        this.yearMonth = this.year * 100 + this.month;
        this.reloadData();
    }
    
    setYear() {
        this.yearMonth = this.year * 100 + this.month;
        this.reloadData();
    }
    
    scrollMonth(increment) {
        this.month += increment;
        if (this.month > 12) {
            this.month = this.month - 12;
            this.year += 1;
        } else if (this.month < 1) {
            this.month = this.month + 12;
            this.year -= 1;
        }
        this.monthStr = '' + this.month;
        this.yearMonth = this.year * 100 + this.month;
        if (increment < 0) {
            this.exchangeData = this.exchangeData.slice(1,3);
            this.exchangeData.splice(3,0,null);
            this.exchangeDisplayData = this.exchangeDisplayData.slice(1,3);
            this.exchangeDisplayData.splice(3,0,null);
            
            this.stationData = this.stationData.slice(1,3);
            this.stationData.splice(3,0,null);
            this.stationDisplayData = this.stationDisplayData.slice(1,3);
            this.stationDisplayData.splice(3,0,null);
            this.getStationData(this.yearMonthOffset(this.yearMonth, -2), 2);
        } else if (increment > 0) {
            this.exchangeData = this.exchangeData.slice(0,2);
            this.exchangeData.splice(0,0,null);
            this.exchangeDisplayData = this.exchangeDisplayData.slice(0,2);
            this.exchangeDisplayData.splice(0,0,null);
            
            this.stationData = this.stationData.slice(0,2);
            this.stationData.splice(0,0,null);
            this.stationDisplayData = this.stationDisplayData.slice(0,2);
            this.stationDisplayData.splice(0,0,null);
            this.getStationData(this.yearMonth, 0);
        }
    }
    
    changeMonth(increment) {
        this.month += increment;
        if (this.month > 12) {
            this.month = 1;
            this.year += 1;
        }
        if (this.month < 1) {
            this.month = 12;
            this.year -= 1;
        }
        this.monthStr = '' + this.month;
        
        this.countrySelect();
    }
    
    monthName(yearMonth) {
        let monthIndex = yearMonth % 100;
        return this.monthNames[monthIndex] + ' ' + Math.floor(yearMonth / 100);
    }
    
    hasBeenModified() {
        for (let idx=0; idx < this.dataEntryData.length; idx++) {
            for (let element in this.dataEntryData[idx]) {
                if (element ==='$$hashKey') {
                    continue;
                }
                if (this.dataEntryData[idx][element] !== this.originalData[idx][element]) {
                    return true;
                }
            }
        }
        return false;
    }
    
    changeExchangeFocus(position) {
        if (this.exchangeDisplayData[position].exchange_rate && this.exchangeDisplayData[position].exchange_rate !== this.exchangeData[position].exchange_rate) {
            this.exchangeData[position].exchange_rate = this.exchangeDisplayData[position].exchange_rate;
            this.saveCount += 1;
            this.service.updateExchangeRate(this.exchangeData[position]).then (() => {
                this.saveCount -= 1;
            });
        }
    }
    
    changeFocus (stationId, element, position) {
        if (this.stationData[position]) {
            let oldStation = null;
            for (let idx=0; idx < this.stationData[position].length; idx++) {
                if (this.stationData[position][idx].station === stationId) {
                    oldStation = this.stationData[position][idx];
                    break;
                }
            }
            if (oldStation === null) {
                oldStation = {
                        station:stationId,
                        year_month:this.yearMonthOffset(this.yearMonth, -position),
                        staff:null,
                        intercepts:null,
                        arrests:null,
                        gospel:null,
                        empowerment:null,
                        budget:null
                        
                };
                this.stationData[position].push(oldStation);
            }
            oldStation[element] = this.stationDisplayData[position][stationId][element];
            this.saveCount += 1;
            this.service.updateStationData(oldStation).then (() => {
                this.saveCount -= 1;
            }, ()=>{
            	let stationName = 'Unknown';
            	let monthName = this.monthName(this.yearMonthOffset(this.yearMonth, -position));
            	for (let idx=0; idx < this.stations.length; idx++) {
            		if (this.stations[idx].id === stationId) {
            			stationName = this.stations[idx].station_name;
            		}
            	}
            	alert("Failed to update data for station:" + stationName + " and month:" + monthName + '\nReloading page');
	        	window.location.reload();
            });
            this.totalColumn(position);
        }
    }
    
    mayEdit(columnIndex) {
        if (this.editAll) {
            return true;
        }
        let checkYearMonth = this.yearMonthOffset(this.yearMonth,-columnIndex);
        return this.editYearMonth.includes(checkYearMonth);
    }
    
    deemphasizeZero(baseClass, value) {
        let fullClass = baseClass
        if (value === 0) {
            fullClass += ' deemphasizeZero';
        }
        
        return fullClass;
    }
    
     openModal(stationDetail) {
        this.modal.open({
            animation: true,
            templateUrl: stationDetailModalTemplate,
            controller: StationDetailModalController,
            resolve: {
                stationDetail: () => stationDetail
            },
            controllerAs: "vm",
            size: 'lg'
        });
    }
    
    getDetail(station, month, type) {
     this.spinner.show('Retrieving details...');
        this.service.getDetail(station, month, type).then(promise => {
        	this.spinner.hide();
            this.openModal(promise.data);
        }, (error) => {
            this.spinner.hide();
            alert(error);
        });
    }
}

export default StationDataController;