/*global FormData */
/* global jQuery */
export default class BorderStationService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getBorderStations(open = null) {
        let params = [];
        if(open !== null) {
            params.push({name: 'open', value: open});
        }
        return this.service.get('api/border-station/', params);
    }
    
    getUserStations(id, group, action) {
        let params = [];
        if (group !== null) {
            params.push({name: 'permission_group', value: group});
        }
        if (action !== null) {
            params.push({name: 'action', value: action});
        }
        
        return this.service.get(`api/user_permission/stations/${id}/`, params);
    }
    
    getAllCountries() {
        return this.service.get('api/country/');
      }
    
    getBorderStation(id) {
        if (id !== null) {
            let url = `api/border_station/-1/${id}`;
            url = `api/border_station/blank/-1`;
            url = `api/border_station/${id}/`;
            return this.service.get(url);
        } else {
            return this.service.get(`api/border_station/blank/`);
        }
    }
    
    submitBorderStation(id, borderStation) {
        if (id === null) {
            return this.postBorderStation(borderStation);
        } else {
            return this.putBorderStation(id, borderStation);
        }
    }
    
    putBorderStation(id, borderStation) {
        let myBorderStation = jQuery.extend(true, {}, borderStation);
        let formData = new FormData();
        formData.append("main", JSON.stringify(myBorderStation));
        return this.service.put(`api/border_station/${id}/`, formData, {'Content-Type': undefined});
    }
    
    postBorderStation(borderStation) {
        let myBorderStation = jQuery.extend(true, {}, borderStation);
        let formData = new FormData();
        formData.append("main", JSON.stringify(myBorderStation));
        return this.service.post(`api/border_station/`, formData, {'Content-Type': undefined});
    }
    
    getFormConfig(formName) {
        let url=`api/forms/config/${formName}/`;
        return this.service.get(url);
    }
    
    getAllTimeZones() {
        return this.service.get('api/timezones/');
     }
    
    getFormTypes() {
        return this.service.get('api/forms/types/');
    }
    
    getAvailableForms() {
        return this.service.get('api/forms/');
    }
}
