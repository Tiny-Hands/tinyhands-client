import SessionService from './session.service';

describe('SessionService', () => {

    let service, mockBaseService, $rootScope;

    beforeEach(inject(($q, _$rootScope_) => {
        $rootScope = _$rootScope_;
        let $state = { go: () => { } },
            $timeout = (f) => { f(); };
        mockBaseService = jasmine.createSpyObj('mockBaseService', ['get', 'post']);
        mockBaseService.get.and.callFake(() => {
            return $q.resolve('success');
        });
        service = new SessionService($rootScope, $state, $timeout, $q, mockBaseService);
    }));


    describe('function constructor', () => {
        it('user should be {}', () => {
            expect(service.user).toEqual({});
        });
    });

    describe('function attemptLogin with username and password', () => {
        let url = 'api/login/',
            username = 'test_user',
            password = 'test_password',
            obj = { username: username, password: password };

        beforeEach(() => {
            let promise = { data: { token: 123 } };
            sessionStorage.token = null;
            mockBaseService.post.and.callFake(() => {
                return {
                    then: (f) => {
                        f(promise);
                    }
                };
            });
        });

        it(`should call post with ${url} and ${obj}`, () => {
            service.attemptLogin(username, password);
            expect(mockBaseService.post).toHaveBeenCalledWith(url, obj);
        });

        let token = "Token 123";
        it(`should set sessionStorage token to "${token}"`, () => {
            service.attemptLogin(username, password);
            expect(sessionStorage.token).toEqual(token);
        });

        it(`should set root authenticated to true`, () => {
            service.attemptLogin(username, password);
            expect(service.root.authenticated).toBe(true);
        });
    });

    describe('function me', () => {

        let result = { data: {id: 'foobar'} };

        beforeEach(() => {
            mockBaseService.get.and.callFake(() => {
                return {
                    then: (f) => {
                        f(result);
                    }
                };
            });
        });

        it("should call get with 'api/me/'", () => {
            service.me();
            expect(mockBaseService.get).toHaveBeenCalledWith('api/me/');
        });

        it(`should set user to '${result.data}'`, () => {
            service.me();
            expect(service.user).toEqual(result.data);
        });

        it("should call root $broadcast with 'GetNavBarBorderStations'", () => {
            spyOn(service.root, '$broadcast');
            service.me();
            expect(service.root.$broadcast).toHaveBeenCalledWith('GetNavBarBorderStations');
        });

    });
    
    describe('function getPermissions', () => {

        let result = { data: { results: {id: 'foobar'}} };

        beforeEach(() => {
            mockBaseService.get.and.callFake(() => {
                return {
                    then: (f) => {
                        f(result);
                    }
                };
            });
        });

        it("should call get with 'api/permission/?page_size=1000'", () => {
            service.getPermissions();
            expect(mockBaseService.get).toHaveBeenCalledWith('api/permission/?page_size=1000');
        });

        it(`should set permissions to '${result.data.results}'`, () => {
            service.getPermissions();
            expect(service.permissions).toEqual(result.data.results); 
        });

    });
    
    describe('function getUserPermissions', () => {

        let result = { data: {id: 'foobar'} };

        beforeEach(() => {
            mockBaseService.get.and.callFake(() => {
                return {
                    then: (f) => {
                        f(result);
                    }
                };
            });
        });

        it("should call BaseService.get with correct url", () => {
            let url = 'api/user_permission/' + service.user.id + '/';
            service.getUserPermissions();
            expect(mockBaseService.get).toHaveBeenCalledWith(url);
        });

        it(`should set user to '${result.data}'`, () => {
            service.getUserPermissions();
            expect(service.userPermissions).toEqual(result.data);
        });

    });

    describe('checkIfAuthenticated', () => {
        describe('when no token stored', () => {
            it('should reject promise', (done) => {
                sessionStorage.clear();

                let result = service.checkIfAuthenticated();

                result.then(() => {
                    done.fail('User is authenticated when they should not be');
                }, (reason) => {
                    expect(reason).toBe('Not Authenticated');
                    done();
                });
                $rootScope.$apply();
            });
        });

        describe('when token is stored', () => {
            it('should set rootScope autheticated to true', (done) => {
                $rootScope.authenticated = false;
                sessionStorage.token = 'validToken';

                let result = service.checkIfAuthenticated();

                result.then(() => {
                    expect($rootScope.authenticated).toBe(true);
                    done();
                }, () => {
                    done.fail('User not authenticated when they should be');
                });
                $rootScope.$apply();
            });

            it('should get current user', (done) => {
                $rootScope.authenticated = false;
                sessionStorage.token = 'validToken';
                spyOn(service, 'me').and.callThrough();

                let result = service.checkIfAuthenticated();

                result.then(() => {
                    expect(service.me).toHaveBeenCalled();
                    done();
                }, () => {
                    done.fail('User not authenticated when they should be');
                });
                $rootScope.$apply();
            });
        });
    });

    describe('function logout', () => {

        it('user should be {}', () => {
            service.logout();
            expect(service.user).toEqual({});
        });

        it('root.authenticated should be false', () => {
            service.logout();
            expect(service.root.authenticated).toBe(false);
        });

        it('should call routeState go with "login"', () => {
            spyOn(service.routeState, 'go');
            service.logout();
            expect(service.routeState.go).toHaveBeenCalledWith('login');
        });

    });

});
