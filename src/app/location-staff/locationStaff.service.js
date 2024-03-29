export default class LocationStaffService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getUserCountries(user_id, permissionGroup, action) {
        return this.service.get(`api/user_permission/countries/${user_id}/?permission_group=${permissionGroup}&action=${action}&enable_all_locations=true`);
    }
    
    getUserStations(user_id, permissionGroup, action, country_id) {
        return this.service.get(`api/user_permission/stations/${user_id}/?permission_group=${permissionGroup}&action=${action}&country_id=${country_id}&feature=hasLocationStaff`);
    }
    
    getStationLocations(station_id) {
        return this.service.get(`api/border-station/${station_id}/location/?include_inactive=true`);
    }
    
    getStationStaff(station_id) {
        return this.service.get(`api/staff/?project_id=${station_id}`);
    }
    
    getLocationStaff(station_id, yearAndMonth) {
        return this.service.get(`api/location-staff/${station_id}/${yearAndMonth}/`);
    }
    
    setWorkFraction(theValue) {
        return this.service.put(`api/location-staff/`, theValue);
    }
    
    getStationData(country_id, yearMonth) {
        return this.service.get(`api/station-data/country/${country_id}/${yearMonth}/`);
    }
    
    updateStationData(data) {
        return this.service.put('api/station-data/country/', data);
    }
}