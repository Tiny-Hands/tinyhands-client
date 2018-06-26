import IntercepteeModalController from './intercepteeModal.controller';

describe('IntercepteeModalController', () => {
    let vm;

    beforeEach(() => {
        let $uibModalInstance = {
            close() {},
            dismiss() {}
        };

        vm = new IntercepteeModalController($uibModalInstance);
    });

    describe('function save', () => {
        beforeEach(() => {
            vm.originalQuestions = [null, null, null, null, null, null, null, {
                response: {}
            }, {
                response: {}
            }, {
                response: {
                    address1: {},
                    address2: {},
                    age: {},
                    gender: {},
                    name: {},
                    nationality: {},
                    phone: {},
                }
            }, {
                response: {}
            }, {
                response: {}
            }];
            vm.questions = [null, null, null, null, null, null, null, {
                response: {}
            }, {
                response: {}
            }, {
                response: {
                    address1: {},
                    address2: {},
                    age: {},
                    gender: {},
                    name: {},
                    nationality: {},
                    phone: {},
                }
            }, {
                response: {}
            }, {
                response: {}
            }];
        });

        it('should set original question 7 to question 7', () => {
            vm.questions[7].response.value = 'I am an interceptee image.png';

            vm.save();

            expect(vm.originalQuestions[7].response.value).toEqual('I am an interceptee image.png');
        });

        it('should set original question 8 to question 8', () => {
            vm.questions[8].response.value = 'Victim';

            vm.save();

            expect(vm.originalQuestions[8].response.value).toEqual('Victim');
        });

        it('should set original question 9 gender to question 9 gender', () => {
            vm.questions[9].response.gender.value = 'Male';

            vm.save();

            expect(vm.originalQuestions[9].response.gender.value).toEqual('Male');
        });

        it('should set original question 9 name to question 9 name', () => {
            vm.questions[9].response.name.value = 'Bob Vance';

            vm.save();

            expect(vm.originalQuestions[9].response.name.value).toEqual('Bob Vance');
        });

        it('should set original question 9 age to question 9 age', () => {
            vm.questions[9].response.age.value = 12;

            vm.save();

            expect(vm.originalQuestions[9].response.age.value).toEqual(12);
        });

        it('should set original question 9 address1 to question 9 address1', () => {
            vm.questions[9].response.address1.name = '123 Easy St';

            vm.save();

            expect(vm.originalQuestions[9].response.address1.name).toEqual('123 Easy St');
        });

        it('should set original question 9 address2 to question 9 address2', () => {
            vm.questions[9].response.address2.name = 'Nepal';

            vm.save();

            expect(vm.originalQuestions[9].response.address2.name).toEqual('Nepal');
        });

        it('should set original question 9 phone to question 9 phone', () => {
            vm.questions[9].response.phone.value = '1234567990';

            vm.save();

            expect(vm.originalQuestions[9].response.phone.value).toEqual('1234567990');
        });

        it('should set original question 11 to question 11', () => {
            vm.questions[11].response.value = true;

            vm.save();

            expect(vm.originalQuestions[11].response.value).toEqual(true);
        });

        it('when file is defined should set original question 7 to file', () => {
            vm.file = {
                type: 'png'
            };

            vm.save();

            expect(vm.originalQuestions[7].response.value).toEqual({
                type: 'png'
            });
        });

        it('should call close', () => {
            spyOn(vm, 'close');

            vm.save();

            expect(vm.close).toHaveBeenCalled();
        });
    });
});