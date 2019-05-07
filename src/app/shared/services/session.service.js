export default class SessionService {
    constructor($rootScope, $state, $timeout, $q, BaseService) {
        'ngInject';

        this.service = BaseService;
        this.root = $rootScope;
        this.routeState = $state;
        this.timeout = $timeout;
        this.$q = $q;

        this.user = {};
        this.userPermissions = [];
        this.permissions = [];
    }

    attemptLogin(username, password) {
        return this.service.post('api/login/', { "username": username, "password": password })
            .then((promise) => {
                sessionStorage.token = "Token " + promise.data.token;
                this.root.authenticated = true;
                return true;
            }, (reason) => {
                let error;
                if (reason.status === 400) {
                    error = "Invalid Login";
                } else {
                    error = "Unable to connect to server";
                }
                this.clearSession();
                return this.$q.reject(error);
            });
    }

    me() {
        return this.service.get('api/me/').then((result) => {
            this.user = result.data;
            
            if (this.permissions.length < 1) {
                this.getPermissions();
            }
            if (typeof this.user !== 'undefined') {
                this.getUserPermissions();
            }       
            return this.user;
        });
    }
    
    getPermissions() {
        return this.service.get(`api/permission/?page_size=1000`).then((result) => {
            this.permissions = result.data.results;
        });
    }
    
    getUserPermissions() {
        return this.service.get(`api/user_permission/${this.user.id}/`).then((result) => {
            this.userPermissions = result.data;
            this.root.$broadcast('GetNavBarBorderStations');
        });
    }
    
    findPermissionId(group, action) {
        let perm = this.permissions.find((perm) => perm.permission_group === group && perm.action === action);
        if (typeof perm !== 'undefined') {
           return perm.id;
        }
        
        return null;
    }
    
    isAnyLocationRequested(countryId, stationId) {
        return countryId === null && stationId === null;
    }
    
    isGlobal(perm) {
        return perm.station === null && perm.country === null;
    }
    
    matchesCountry(perm, countryId) {
        return countryId !== null && perm.country === countryId && perm.station === null;
    }
    
    matchesStation(perm, stationId) {
        return stationId !== null && perm.station === stationId;
    }
    
    checkPermission(group, action, countryId, stationId) {
        let perms = this.getUserPermissionList(group, action);
        let thePerm = perms.find((perm) => (
                this.isAnyLocationRequested(countryId, stationId) || 
                this.isGlobal(perm) || 
                this.matchesCountry(perm, countryId) || 
                this.matchesStation(perm,stationId)));
        if (typeof thePerm !== 'undefined') {
            return true;
        }
        
        return false;
    }
    
    getUserPermissionList(group, action) {
        let permId = this.findPermissionId(group, action);
        let perms = this.userPermissions.filter((perm) => perm.permission === permId);
        return perms;
    }

    checkIfAuthenticated() {
        let defer = this.$q.defer();
        if (typeof sessionStorage.token === 'undefined') {
            defer.reject('Not Authenticated'); 
            return defer.promise;
        } else {
            this.root.authenticated = true;
            return this.me();
        }
    }

    logout() {
        this.clearSession();
        this.routeState.go('login');
    }

    clearSession() {
        sessionStorage.removeItem('token');
        this.user = {};
        this.root.authenticated = false; // Set authenticated to false
    }
}
