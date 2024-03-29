export default class LocationDataService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getUserCountries(user_id, permissionGroup, action) {
        return this.service.get(`api/user_permission/countries/${user_id}/?permission_group=${permissionGroup}&action=${action}&enable_all_locations=true`);
    }
    
    getUserStations(user_id, permissionGroup, action, country_id) {
        return this.service.get(`api/user_permission/stations/${user_id}/?permission_group=${permissionGroup}&action=${action}&country_id=${country_id}&feature=hasLocations`);
    }
    
    getStationLocations(station_id) {
        return this.service.get(`api/border-station/${station_id}/location/?include_inactive=true`);
    }
    
    getLocationData(station_id, yearAndMonth) {
        return this.service.get(`api/location-statistics/${station_id}/${yearAndMonth}/`);
    }
    
    setLocationStatistics(theValue) {
        return this.service.put(`api/location-statistics/`, theValue);
    }
}