export default class SessionService {
    constructor($rootScope, $state, $timeout, $q, BaseService, $cookies, auth0Service) {
        'ngInject';

        this.service = BaseService;
        this.root = $rootScope;
        this.routeState = $state;
        this.timeout = $timeout;
        this.$q = $q;
        this.cookies = $cookies;
        this.auth0Service = auth0Service;

        this.user = {};
        this.userPermissions = [];
        this.permissions = [];
    }

    attemptLogin(username, password) {
        return this.service.post('api/login/', { "username": username, "password": password })
            .then((promise) => {
                localStorage.token = "Token " + promise.data.token;
                if (promise.data.sessionid) {
                    var expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 1);
                    this.cookies.put('sessionid', promise.data.sessionid, {'expires': expireDate});
                }
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
            if (typeof this.user !== 'undefined' && this.userPermissions.length < 1) {
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

    checkIfAuthenticatedAuth0() {
        let defer = this.$q.defer();
        if(this.auth0Service.clientReadyPromise) {
            const nonQPromise = this.auth0Service.clientReadyPromise.then((client) => {
                return client.isAuthenticated();
            }).then((isAuthenticated) => {
                if(!isAuthenticated){
                    defer.reject('Not Authenticated');
                    return defer.promise;
                } else {
                    return this.me().then(() => {
                        this.root.authenticated = true;
                    });
                }
            });
            // When everything returns, trigger angular digest cycle to refresh page
            return this.$q.when(nonQPromise);
        } else {
            defer.reject('Not Authenticated');
            return defer.promise;
        }
    }

    checkIfAuthenticated() {
        if (typeof localStorage.token === 'undefined') {
            return this.checkIfAuthenticatedAuth0();
        } else {
            this.root.authenticated = true;
            return this.me();
        }
    }

    logout() {
        this.service.get('api/logout/');
        if(this.auth0Service.clientReadyPromise) {
            const nonQPromise = this.auth0Service.clientReadyPromise.then((client) => {
                client.logout();
            }).finally(() => {
                // Always do legacy logout
                this.logoutLegacy();
            });
            // When everything returns, trigger angular digest cycle to refresh page
            return this.$q.when(nonQPromise);
        } else {
            this.logoutLegacy();
        }
    }

    logoutLegacy() {
        this.clearSession();
        this.routeState.go('login');
    }
    
    refreshPermissions() {
    	this.userPermissions = [];
        this.permissions = [];
        this.getPermissions();
        this.getUserPermissions();
    }

    clearSession() {
        localStorage.removeItem('token');
        this.user = {};
        this.userPermissions = [];
        this.permissions = [];
        this.root.authenticated = false; // Set authenticated to false
    }
}
