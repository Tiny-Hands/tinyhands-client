import AccountController from './account.controller';

describe('account Controller', () => {
    let vm,
    $q,
    $scope,
    $timeout,
    $uibModal,
    $state,
    mockAccountService,
    mockPermissionsSetsService;


    beforeEach(inject((_$q_, $rootScope, _$timeout_) => {
        $q = _$q_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
        $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
        $state = {params: {id: 1}, transitionTo: () => {}, go: () => {}};
        mockAccountService = jasmine.createSpyObj('AccountService', [
            'getAccounts',     
            'getAccount', 
            'getMe', 
            'update',
            'activateAccount',
            'create',
            'resendActivationEmail',
            'activateAccountPassword',
            'destroy'
        ]);
        mockAccountService.getMe.and.callFake(() => {
            return $q.when({});
        });
        mockAccountService.getAccounts.and.callFake(() => {
            return $q.when([]); 
        });
        mockAccountService.getAccount.and.callFake((id) => {
            return $q.when({id: id}) 
        });
        
        mockPermissionsSetsService = jasmine.createSpyObj('PermissionsSetsService', [
            'getPermissions',
            'getPermission',
            'create',
            'update',
            'destroy'
        ]);
        mockPermissionsSetsService.getPermissions.and.callFake(() => {
            return $q.when([]);
        });
        
        vm = new AccountController($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
    }));

    describe('function constructor', () => {
        it(`tab_1_name should be equal to 'Accounts List'`, () => {
            expect(vm.tab_1_name).toEqual('Accounts List');
        });
        it(`tab_2_name should be equal to 'Access Control'`, () =>{
            expect(vm.tab_2_name).toEqual('Access Control');
        });
        it(`tab_3_name should be equal to 'Access Defaults'`, () =>{
            expect(vm.tab_3_name).toEqual('Access Defaults');
        });
        it(`sections should be object`, () => {
            let accountOptionsPath = 'app/account/components/';
            let sections = {allSections: [{ name: vm.tab_1_name , templateUrl: `${accountOptionsPath}list/accountList.html` },
                { name: vm.tab_2_name , templateUrl: `${accountOptionsPath}control/accessControl.html` },
                { name: vm.tab_3_name , templateUrl: `${accountOptionsPath}defaults/accessDefaults.html`}]};
                expect(vm.sections).toEqual(sections);
            });
        it(`tabInfo should be an object`, () => {
            let tabInfo = {'active': null, 'sectionTemplateUrl': null};
            expect(vm.tabInfo).toEqual(tabInfo);
        });
        it(`saveButtonInfo should be an object`, () => {
            let saveButtonInfo = {"saveButtonText":"Saved", "saveButtonColor":"btn-primary", "unsavedChanges": false};
            expect(vm.saveButtonInfo).toEqual(saveButtonInfo);
        });
        it(`should call AccountService.getMe`, () => {
            expect(mockAccountService.getMe).toHaveBeenCalled();
        });
        it(`should set currentuser equal to '{id: 123}'`, () => {
            let response = {data: {id: 123}};
            mockAccountService.getMe = () => {return {then: (f) => { f(response) }}};
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            //$scope.$apply();
            expect(vm.currentuser).toEqual(response.data);
        });
        it(`should call AccountService.getAccounts`, () => {
            expect(mockAccountService.getAccounts).toHaveBeenCalled();
        });
        it(`should set accounts.local equal to '{id: 123}'`, () => {
            let result = {data: {id: 123}};
            mockAccountService.getAccounts = () => {return {then: (f) => { f(result) }}};
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            //$scope.$apply();
            expect(vm.accounts.local).toEqual(result.data);
        });
        it(`should set accounts.saved equal to accounts.local`, () => {
            let result = {data: {id: 123}};
            mockAccountService.getAccounts = () => {return {then: (f) => { f(result) }}};
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.accounts.saved).toEqual(result.data);
        });
        it(`should call PermissionsSetsService.getPermissions`, () => {
            expect(mockPermissionsSetsService.getPermissions).toHaveBeenCalled();
        });
        it(`should set permissions.local equal to '{foo: true}'`, () => {
            let result = {data: {results: {foo: true}}};
            mockPermissionsSetsService.getPermissions = () => {return {then: (f) => { f(result) }}};
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.permissions.local).toEqual(result.data.results);
        });
        it(`should set permissions.saved equal to '{foo: true}'`, () => {
            let result = {data: {results: {foo: true}}};
            mockPermissionsSetsService.getPermissions = () => {return {then: (f) => { f(result) }}};
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.permissions.saved).toEqual(result.data.results);
        });
        it(`accountCreate should be called`, () => {
            vm.$state.params.id = 'create';
            spyOn(vm, 'accountCreate');
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.accountCreate).toHaveBeenCalled();
        });
        it(`retrieveAccount should be called`, () => {
            vm.$state.params.id = 1;
            spyOn(vm, 'retrieveAccount');
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.retrieveAccount).toHaveBeenCalled();
        });
        it(`activeTab should be equal to 0`, () => {
            vm.$state.params.id = false;
            vm.$state.params.activeTab = undefined;
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect($state.params.activeTab).toEqual(0);
        });
        it(`switchActive should be called`, () => {
            vm.$state.params.id = false;
            vm.$state.params.activeTab = 1;
            spyOn(vm, 'switchActive');
            vm.constructor($q, $scope, $timeout, $uibModal, $state, mockAccountService, mockPermissionsSetsService);
            expect(vm.switchActive).toHaveBeenCalled();
        });
    });

    describe('function switchActive', () => {
        let index = 1;
        it(`openUnsavedChangesModal should be called`, () => {
            vm.saveButtonInfo.unsavedChanges = true;
            spyOn(vm, 'openUnsavedChangesModal');
            vm.switchActive(index);
            expect(vm.openUnsavedChangesModal).toHaveBeenCalled();
        });
        it(`activateTab should be called`, () => {
            vm.saveButtonInfo.unsavedChanges = false;
            spyOn(vm, 'activateTab');
            vm.switchActive(index);
            expect(vm.activateTab).toHaveBeenCalled();
        });
    });

    describe('function activateTab', () => {
        let index = 1;
        it(`tabInfo.active should be 1`, () => {
            vm.activateTab(index);
            expect(vm.tabInfo.active).toEqual(1);
        });
        it(`tabInfo.sectionTemplateUrl should be equal to sections.allSections[1].templateUrl`, () => {
            let section = vm.sections.allSections[1].templateUrl;
            vm.activateTab(index);
            expect(vm.tabInfo.sectionTemplateUrl).toEqual(section);
        });
        it(`$state.go should be called`, () => {
            spyOn(vm.$state, 'go');
            vm.activateTab(index);
            expect(vm.$state.go).toHaveBeenCalled();
        });
    });

    describe('function retrieveAccount', () => {
        let id = 1;
        it(`AccountService.getAccount should be called`, () => {
            vm.retrieveAccount(id);
            expect(mockAccountService.getAccount).toHaveBeenCalled();
        });

        it(`accountEdit should be called`, () => {
            let result = {data: {id: 1}};
            mockAccountService.getAccount = () => {return {then: (f) => { f(result) }}};
            spyOn(vm, 'accountEdit');
            vm.retrieveAccount(id);
            expect(vm.accountEdit).toHaveBeenCalled();
        });
    });

    describe('function accountEdit', () => {
        let account = {first_name: 'James', last_name: 'Rodger', id: 123};
        it(`tabInfo.active should be null`, () => {
            vm.accountEdit(account);
            expect(vm.tabInfo.active).toEqual(null);
        });
        it(`tabInfo.sectionTemplateUrl should be equal to editAccountPath`, () => {
            let section = vm.editAccountPath;
            vm.accountEdit(account);
            expect(vm.tabInfo.sectionTemplateUrl).toEqual(section);
        });
        it(`vm.account should be equal to account`, () => {
            vm.accountEdit(account);
            expect(vm.account).toEqual(account);
        });
        it(`editing should be equal to true`, () => {
            vm.accountEdit(account);
            expect(vm.editing).toEqual(true);
        });

        it(`$state.go should be called`, () => {
            spyOn(vm.$state, 'go');
            vm.accountEdit(account);
            expect(vm.$state.go).toHaveBeenCalled();
        });
    });

    describe('function accountCreate', () => {
        it(`tabInfo.active should be equal to null`, () => {
            vm.tabInfo.active = 0;
            vm.accountCreate();
            expect(vm.tabInfo.active).toEqual(null);
        });
        it(`tabeInfo.sectionTemplateUrl should be equal to editAccountPath`, () => {
            vm.accountCreate();
            expect(vm.tabInfo.sectionTemplateUrl).toEqual(vm.editAccountPath);
        });
        it(`$state.go should be called`, () => {
            spyOn(vm.$state, 'go');
            vm.accountCreate();
            expect(vm.$state.go).toHaveBeenCalled();
        });
    });

    describe('function accountNotFound', () => {
        let id = 123;
        it(`vm.idNotFound should be equal to id`, () => {
            vm.accountNotFound(id);
            expect(vm.idNotFound).toEqual(id);
        });
        it(`tabInfo.active should be equal to -1`, () => {
            vm.accountNotFound(id);
            expect(vm.tabInfo.active).toEqual(-1);
        });
        it(`tabInfo.sectionTemplateUrl should be equal to accountNotFoundPath`, () => {
            vm.accountNotFound(id);
            expect(vm.tabInfo.sectionTemplateUrl).toEqual(vm.accountNotFoundPath);
        });
    });

    describe('function saveAll', () => {
        beforeEach(() =>    {
            vm.accounts = {local: [{id: 123, is_modified: true, permission_accounts_manage: true}], saved: [{id: 123, permission_accounts_manage: false}]};
        });
        it(`updateSaveButton should be called`, () => {
            spyOn(vm, 'updateSaveButton');
            vm.saveAll(vm.accounts, mockAccountService);
            expect(vm.updateSaveButton).toHaveBeenCalled();
        });
        it(`saveSet should be called`, () => {
            spyOn(vm, 'saveSet');
            vm.saveAll(vm.accounts, mockAccountService);
            expect(vm.saveSet).toHaveBeenCalled();
        });
    });

    describe('function saveSet', () => {
        let index = 0;
        let local = [{id: 123, is_modified: false, is_new: false}];
        beforeEach(() => {
            local = [{id: 123, is_modified: false, is_new: false}];
        });
        it(`create should be called`, () => {
            local[0].is_new = true;
            vm.saveSet(index, local, mockAccountService);
            $scope.$apply();
            expect(mockAccountService.create).toHaveBeenCalled();
        });
        it(`update should be called`, () => {
            local[0].is_modified = true;
            vm.saveSet(index, local, mockAccountService);
            $scope.$apply();
            expect(mockAccountService.update).toHaveBeenCalled();
        });

    });

    describe('function checkIfModified', () => {
        let arrays = {local: [{is_new: false, is_modified: false, id: 123}], saved: [{is_new: false, is_modified: false, id: 123}]};
        let index = 0;
        it(`arrays.local[0].is_modified should be false`, () => {
            vm.checkIfModified(index, arrays);
            expect(arrays.local[index].is_modified).toEqual(false);
        });
        it(`checkForUnsavedChanges should be called`, () => {
            spyOn(vm, 'checkForUnsavedChanges');
            vm.checkIfModified(index, arrays);
            expect(vm.checkForUnsavedChanges).toHaveBeenCalled();
        });
        it(`arrays.local[0].is_modified should be true`, () => {
            arrays.local[0].id = 321;
            vm.checkIfModified(index, arrays);
            expect(arrays.local[index].is_modified).toEqual(true);
        });
        it(`arrays.local[0].is_modified should be true`, () => {
            arrays.local[0].is_new = true;
            vm.checkIfModified(index, arrays);
            expect(arrays.local[index].is_modified).toEqual(true);
        });
    });

    describe('function checkForUnsavedChanges', () => {
        let arrays = {local: [{is_new: false, is_modified: false, id: 123}], saved: [{is_new: false, is_modified: false, id: 123}]};
        it(`updateSaveButton should be called`, () => {
            spyOn(vm, 'updateSaveButton');
            vm.checkForUnsavedChanges(arrays);
            expect(vm.updateSaveButton).toHaveBeenCalled();
        });
    });

    describe('function updateSaveButton', () => {
        it(`saveButtonText should be equal to text`, () => {
            vm.updateSaveButton(vm.saveText, vm.saveColor, true, 100);
            $timeout.flush();
            expect(vm.saveButtonInfo.saveButtonText).toEqual(vm.saveText);
        });
        it(`saveButtonColor should be equal to color`, () => {
            vm.updateSaveButton(vm.saveText, vm.saveColor, true, 100);
            $timeout.flush();
            expect(vm.saveButtonInfo.saveButtonColor).toEqual(vm.saveColor);
        });
        it(`unsavedChanges should be true`, () => {
            vm.updateSaveButton(vm.saveText, vm.saveColor, true, 100);
            $timeout.flush();
            expect(vm.saveButtonInfo.unsavedChanges).toEqual(true);
        });
        it(`unsavedChanges should be false`, () => {
            vm.updateSaveButton(vm.savedText, vm.savedColor, false, 100);
            $timeout.flush();
            expect(vm.saveButtonInfo.unsavedChanges).toEqual(false);
        });

    });

    describe('function updateAccountButton', () => {
        it(`accountButtonText should be equal to text`, () => {
            vm.updateAccountButton(vm.saveText, vm.saveColor, 100);
            $timeout.flush();
            expect(vm.accountButtonInfo.accountButtonText).toEqual(vm.saveText);
        });
        it(`accountButtonColor should be equal to color`, () => {
            vm.updateAccountButton(vm.saveText, vm.saveColor, 100);
            $timeout.flush();
            expect(vm.accountButtonInfo.accountButtonColor).toEqual(vm.saveColor);
        });
    });

    describe('function discardChanges', () => {
        let arrays = {local: [{is_new: false, is_modified: true, id: 321}], saved: [{is_new: false, is_modified: false, id: 123}]};
        it(`local array should be the same as saved array`, () => {
            vm.discardChanges(arrays);
            expect(arrays.local).toEqual(arrays.saved);
        });
        it(`updateSaveButton should be called`, () => {
            spyOn(vm, 'updateSaveButton');
            vm.discardChanges(arrays);
            expect(vm.updateSaveButton).toHaveBeenCalled()
        });
    });

    describe('function openUnsavedChangesModal', () => {
        let index = 0;
        let toState = null;
        beforeEach(() => {
            vm.sections = {allSections: [{name: vm.tab_2_name, templateUrl: 'app/account/components/control/accountControl.html'}]};
            vm.tabInfo = {active: 0}
        });
        it(`$uibModal.open should be called`, () => {
            $uibModal.open.and.callFake(() => {
                return {result: $q.when('save')};
            });
            vm.openUnsavedChangesModal(index, toState);
            expect($uibModal.open).toHaveBeenCalled();
        });
        it(`saveAll should be called`, () => {
            $uibModal.open.and.callFake(() => {
                return {result: $q.when('save')};
            });
            spyOn(vm, 'saveAll').and.returnValue($q.resolve());;
            vm.openUnsavedChangesModal(index, toState);
            $scope.$apply();
            expect(vm.saveAll).toHaveBeenCalled();
        });
        it(`discardChanges should be called`, () => {
            $uibModal.open.and.callFake(() => {
                return {result: $q.when('discard')};
            });
            spyOn(vm, 'discardChanges');
            vm.openUnsavedChangesModal(index, toState);
            $scope.$apply();
            expect(vm.discardChanges).toHaveBeenCalled();
        });
        // test openUnsavedChangesModal
    });

    describe('function resendActivationEmail', () => {
        let id = 123;
        it(`resendActivationEmail should be called`, () =>  {
            vm.resendActivationEmail(id);
            expect(mockAccountService.resendActivationEmail).toHaveBeenCalledWith(id);
        });
    });

    describe('function deleteAccount', () => {
        beforeEach(() => {
            vm.currentuser = {id: 1};
            mockAccountService.destroy = () => {return {then: (f) => { f(true) }}};
        });
        let account = {id: 123, accountdelete: true};
        it(`destroy should be called`, () => {
            vm.deleteAccount(account);
            expect(mockAccountService.destroy).toHaveBeenCalledWith(account);
        });
        it(`getAccounts should be called`, () => {
            vm.deleteAccount(account);
            expect(mockAccountService.getAccounts).toHaveBeenCalled();
        });
        it(`accounts should be equal to the response`, () => {
            let response = {data: {id: 321}};
            mockAccountService.getAccounts.and.callFake(() => {
                return $q.when(response);
            })
            vm.deleteAccount(account);
            expect(vm.accounts.local).toEqual(response.data);
        });
        it(`accountdelete should be true`, () => {
            account.accountdelete = false;
            vm.deleteAccount(account);
            expect(account.accountdelete).toEqual(true);
        });
    });

    describe('function changeUserRole', () => {
        let index = 0;
        beforeEach(() => {
            vm.accounts = {local: [{user_designation: 1}], saved: [{user_designation: 1}]};
        });
        it(`should call getPermission`, () => {
            vm.changeUserRole(index);
            expect(mockPermissionsSetsService.getPermission).toHaveBeenCalled();
        });
        it(`should call checkIfModified`, () => {
            spyOn(vm, 'checkIfModified');
            vm.changeUserRole(index);
            expect(vm.checkIfModified).toHaveBeenCalled();
        });
    });

    describe('function addAnother', () => {
        beforeEach(() => {
            vm.permissions = {local: [{id: 123}], saved: [{id: 213}]};
        });
        it(`permissions.local[1] is_new should be true`, () => {
            vm.addAnother();
            expect(vm.permissions.local[1].is_new).toEqual(true);
        });
        it(`checkForUnsavedChanges should be called`, () => {
            spyOn(vm, 'checkForUnsavedChanges');
            vm.addAnother();
            expect(vm.checkForUnsavedChanges).toHaveBeenCalled();
        });
    });

    describe('function deletePermissionRole', () => {
        let index = 0;
        beforeEach(() => {
            vm.permissions = {local: [{is_used_by_accounts: false, accountRemoved: true, is_new: true}], saved: []};
        });
        it(`checkForUnsavedChanges should be called`, () => {
            spyOn(vm, 'checkForUnsavedChanges');
            vm.deletePermissionRole(index);
            expect(vm.checkForUnsavedChanges).toHaveBeenCalled();
        });
        it(`destroy should be called`, () => {
            vm.permissions.local[0].is_new = false;
            vm.deletePermissionRole(index);
            expect(mockPermissionsSetsService.destroy).toHaveBeenCalledWith(index);
        });
        it(`accountRemoved should be true`, () => {
            vm.permissions.local[0].accountRemoved = false;
            vm.deletePermissionRole(index);
            expect(vm.permissions.local[index].accountRemoved).toEqual(true);
        });
    });

    describe('function updateOrCreate', () => {
        beforeEach(() => {
            vm.account = {id: 123, email: 'troll@taylor.edu', user_designation: 1};
            vm.editing = true;
        });
        it(`updateAccountButton should be called`, () => {
            spyOn(vm, 'updateAccountButton');
            vm.updateOrCreate();
            expect(vm.updateAccountButton).toHaveBeenCalled();
        });
        it(`update should be called`, () => {
            vm.updateOrCreate();
            $scope.$apply();
            expect(mockAccountService.update).toHaveBeenCalled();
        });
        it(`create should be called`, () => {
            vm.editing = false;
            vm.updateOrCreate();
            $scope.$apply();
            expect(mockAccountService.create).toHaveBeenCalled();
        });
    });

    describe('function checkFields', () => {
        beforeEach(() => {
            vm.account = {email: 'troll@taylor.edu', user_designation: 1};
        });
        it(`returnValue should be true`, () => {
            let returnValue = vm.checkFields();
            expect(returnValue).toEqual(true);
        });
        it(`returnValue should be false`, () => {
            vm.account.email = '';
            let returnValue = vm.checkFields();
            expect(returnValue).toEqual(false);
        });
        it(`returnValue should be false`, () => {
            vm.account.user_designation = 0;
            let returnValue = vm.checkFields();
            expect(returnValue).toEqual(false);
        });
    });

    describe('function onUserDesignationChanged', () => {
        it(`getPermission should be called`, () => {
            let permissionSetId = 1;
            vm.onUserDesignationChanged(permissionSetId);
            expect(mockPermissionsSetsService.getPermission).toHaveBeenCalledWith(permissionSetId);
        });
    });

    describe('function getUpdateButtonText', () => {
        beforeEach(() => {
            vm.editing = true;
        });
        it(`updateAccountButton should be called`, () => {
            spyOn(vm, 'updateAccountButton');
            vm.getUpdateButtonText();
            expect(vm.updateAccountButton).toHaveBeenCalled();
        });
    });
});
