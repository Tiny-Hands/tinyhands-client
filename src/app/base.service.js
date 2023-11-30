import constants from './constants';
import {AUTH0_AUDIENCE_ID} from "./auth0.service";

/**
 * Base class that all services should extend.
 *
 * @class BaseService
 */
export default class BaseService {
    /**
     * Creates an instance of BaseService.
     *
     * @param $http Angular http service
     * @param auth0Service Service to help with Auth0 authentication
     * @param $q Helps to wrap legacy token making in promise to match Auth0
     */
    constructor($http, auth0Service, $q) {
        'ngInject';

        this.$http = $http;
        this.auth0Service = auth0Service;
        this.$q = $q;

        this.baseUrl = constants.BaseUrl;
    }

    /**
     * Function to add the token to the header.
     *
     * @param {Object} [headers] JSON object containing header options.
     */
    addAuth0TokenAsync(headers) {
        if (this.auth0Service.clientReadyPromise) {
            const nonQPromise = this.auth0Service.clientReadyPromise.then((auth0Client) => {
                // Cached in localstorage hopefully
                const accessTokenPromise = auth0Client.getTokenSilently({
                    audience: AUTH0_AUDIENCE_ID,
                }).then((accessToken) => {
                    if (!accessToken) {
                        throw Error( 'No access token from Auth0');
                    } else {
                        const authHeader = `Bearer ${accessToken}`;
                        headers.Authorization = authHeader;
                    }
                }).catch(() => {
                    // Continue with no auth eader
                });
                return accessTokenPromise;
            });
            // When everything returns, trigger angular digest cycle to refresh page
            return this.$q.when(nonQPromise);
        } else {
            let defer = this.$q.defer();
            // Don't reject, because api/login works without token
            defer.resolve();
            return defer.promise;
        }
    }

    addTokenAsync(headers) {
        if (localStorage.getItem('token')) {
            headers.Authorization = localStorage.token;
            let defer = this.$q.defer();
            // Don't reject, because api/login works without token
            defer.resolve();
            return defer.promise;
        } else {
            return this.addAuth0TokenAsync(headers);
        }
    }

    /**
     * HTTP delete function
     *
     * @param {string} url Url string for api endpoint
     * @param {Object} [headers] JSON object containing header options.
     * @returns Promise of http response.
     */
    delete(url, headers = {}) {
        return this.addTokenAsync(headers).then(() => {
            return this.$http.delete(this.baseUrl + url, {headers: headers});
        });
    }

    /**
     * HTTP get function
     *
     * @param {string} url Url string for api endpoint
     * @param {Array} [params] Array of JSON objects formatted [ { name: "first", value: "Rick" }, { name: "last", value: "Astley" }, { name: "job", value: "Rock Star" } ]
     * @param {Object} [headers] JSON object containing header options.
     * @returns Promise of http response.
     */
    get(url, params = [], headers = {}) {
        return this.addTokenAsync(headers).then(() => {

            if (params.length > 0) {
                params = params ? '?' + $.param(params) : '';
            } else {
                params = '';
            }

            return this.$http.get(this.baseUrl + url + params, {headers: headers});
        });
    }


    /**
     * HTTP post function
     *
     * @param {string} url Url string for api endpoint.
     * @param data Data that is being created.
     * @param {Object} [headers] JSON object containing header options.
     * @returns Promise of http response.
     */
    post(url, data, headers = {}) {
        return this.addTokenAsync(headers).then(() => {
            return this.$http.post(this.baseUrl + url, data, {headers: headers});
        });
    }


    /**
     * HTTP put function
     *
     * @param {string} url Url string for api endpoint
     * @param data Data that is being updated.
     * @param {Object} [headers] JSON object containing header options.
     * @returns Promise of http response.
     */
    put(url, data, headers = {}) {
        return this.addTokenAsync(headers).then(() => {

            return this.$http.put(this.baseUrl + url, data, {headers: headers});
        });
    }
}
