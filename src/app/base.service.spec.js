import BaseService from './base.service';
import constants from './constants.js';

describe('BaseService', () => {

    let service;

    beforeEach(inject(($http) => {
        service = new BaseService($http);
    }));

    describe('function constructor', () => {
        it(`baseUrl should be '${constants.BaseUrl}'`, () => {
            expect(service.baseUrl).toEqual(constants.BaseUrl);
        });
    });


    describe('function get with url, params, and headers', () => {

        let testParams = [{ name: 'first', value: 'Rick' }, { name: 'last', value: 'Astley' }];
        let headers = { a: 'b', c: 'd' };
        let finalHeaders = { headers: headers };
        let url = 'test/url/';
        let testUrl = constants.BaseUrl + url + '?' + $.param(testParams);
        let testUrlEmptyParams = constants.BaseUrl + url;

        it("should set headers Authorization if getItem('token')", () => {
            let headers = {};
            let old = sessionStorage.getItem('token');
            sessionStorage.setItem('token', true);
            service.get('', [], headers);
            expect(headers.Authorization).toBeDefined();
            sessionStorage.setItem('token', old);
        });

        it("should not set headers Authorization if not getItem('token')", () => {
            let headers = {};
            let old = sessionStorage.getItem('token');
            sessionStorage.removeItem('token');
            service.get('', [], headers);
            expect(headers.Authorization).not.toBeDefined();
            sessionStorage.setItem('token', old);
        });

        it(`should call $http get with '${testUrl}' and ${finalHeaders}`, () => {
            spyOn(service.$http, 'get');
            service.get(url, testParams, headers);
            expect(service.$http.get).toHaveBeenCalledWith(testUrl, finalHeaders);
        });

        it(`should call $http get with '${testUrlEmptyParams}' and ${finalHeaders}`, () => {
            spyOn(service.$http, 'get');
            service.get(url, [], headers);
            expect(service.$http.get).toHaveBeenCalledWith(testUrlEmptyParams, finalHeaders);
        });
    });


    describe('post with url, data, and userHeaders', () => {

        let url = 'test/url/';
        let finalUrl = constants.BaseUrl + url;
        let headers = { a: 1, b: 2 };
        let data = 'asdlfkj';
        let finalHeaders = { headers: headers };

        it(`should call $http post with '${finalUrl}', ${data}, and ${finalHeaders}`, () => {
            let old = sessionStorage.getItem('token');
            sessionStorage.removeItem('token');
            spyOn(service.$http, 'post');
            service.post(url, data, headers);
            expect(service.$http.post).toHaveBeenCalledWith(finalUrl, data, finalHeaders);
            sessionStorage.setItem('token', old);
        });
    });


    describe('put with url, data, and userHeaders', () => {

        let url = 'test/url/';
        let finalUrl = constants.BaseUrl + url;
        let headers = { a: 1, b: 2 };
        let data = 'asdlfkj';
        let finalHeaders = { headers: headers };

        it(`should call $http put with '${finalUrl}', ${data}, and ${finalHeaders}`, () => {
            let old = sessionStorage.getItem('token');
            sessionStorage.removeItem('token');
            spyOn(service.$http, 'put');
            service.put(url, data, headers);
            expect(service.$http.put).toHaveBeenCalledWith(finalUrl, data, finalHeaders);
            sessionStorage.setItem('token', old);
        });
    });
});
