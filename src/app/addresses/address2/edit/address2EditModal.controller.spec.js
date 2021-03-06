import Address2EditModalController from './address2EditModal.controller';

describe('Address2EditModalController', () => {
    let vm,
        $state;

    beforeEach(() => {
        let uibModal = {
            close: () => { },
            dismiss: () => { }
        },
            address = { canonical_name: null },
            scope = { address: null },
            addr2Service = { getFuzzyAddress2s: null },
            addr1Service = { getFuzzyAddress1s: null };

            $state = {go: () => {}};
        vm = new Address2EditModalController(uibModal, address, scope, addr2Service, addr1Service, $state);
    });

    describe('function save', () => {
        let address = { id: -1, name: "Empty" };

        it(`should set scope.address.canonical_name to ${address} if empty`, () => {
            vm.scope.address.canonical_name = null;
            vm.save();
            expect(vm.scope.address.canonical_name).toEqual({ id: -1, name: "Empty" });
        });

        it(`should call modalInstance close with scope.address`, () => {
            spyOn(vm.modalInstance, 'close');
            spyOn(vm.state, 'go');

            vm.save();
            expect(vm.modalInstance.close).toHaveBeenCalledWith(vm.scope.address);
            expect(vm.state.go).toHaveBeenCalledWith('address2', {editId: null}, {notify: false});
        });

    });

    describe('function cancel', () => {
        it('should call modalInstance dismiss with "close"', () => {
            spyOn(vm.modalInstance, 'dismiss');
            spyOn(vm.state, 'go');

            vm.cancel();

            expect(vm.state.go).toHaveBeenCalledWith('address2', {editId: null}, {notify: false});
            expect(vm.modalInstance.dismiss).toHaveBeenCalledWith('close');
        });
    });

    describe('function getFuzzyAddress1s', () => {
        it('should return "foo"', () => {
            vm.address1Service.getFuzzyAddress1s = () => {
                return {
                    then: (f) => {
                        return f({ data: 'foo' });
                    }
                };
            };
            expect(vm.getFuzzyAddress1s()).toEqual('foo');
        });
    });

    describe('function getFuzzyAddress2s', () => {
        it('should return "foo"', () => {
            vm.address2Service.getFuzzyAddress2s = () => {
                return {
                    then: (f) => {
                        return f({ data: 'foo' });
                    }
                };
            };
            expect(vm.getFuzzyAddress2s()).toEqual('foo');
        });
    });

});
