import {AUTH0_AUDIENCE_ID} from "../auth0.service";

class LoginController {
    constructor($state, $stateParams, toastr, SessionService, auth0Service) {
        'ngInject';

        this.returnStateName = $stateParams.returnState === undefined ? "dashboard" : $stateParams.returnState;
        this.returnStateParams = this.getStateParamsFromUrl($stateParams.params);
        this.password = "";
        this.username = "";
        this.$state = $state;
        this.toastr = toastr;
        this.session = SessionService;
        this.session.clearSession();

        this.auth0Service = auth0Service;
    }

    attemptAuth0Login() {
        this.auth0Service.clientReadyPromise.then(auth0Client => {
            // https://www.sitepoint.com/easy-angularjs-authentication-with-auth0/
            auth0Client.getTokenWithPopup({
                authorizationParams: {
                    audience: AUTH0_AUDIENCE_ID
                }
            }).then(() => {
                this.$state.go(this.returnStateName, this.returnStateParams);
            }, (reason) => {
                this.toastr.error(reason);
            });
        });
    }

    attemptLogin() {
        this.session.attemptLogin(this.username, this.password).then(() => {
            this.$state.go(this.returnStateName, this.returnStateParams);
        }, (reason) => {
            this.toastr.error(reason);
        });
    }

    getStateParamsFromUrl(queryString) {
        if (angular.isDefined(queryString)) {
            return JSON.parse('{"' + decodeURI(queryString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
        }
        return {};
    }
}

export default LoginController;
