import {
    IrfIndiaController
}
from "./india.component";

const DateTimeId = 4;
const OtherContactId = 92;
const OtherRedFlagId = 31;
const OtherSignId = 134;
const OtherWebsiteId = 244;

describe('IrfIndiaController', () => {
    let vm;
    beforeEach(() => {
        let IndiaService = {
            getIndiaIrf: () => ({
                then: () => {}
            }),
            getLocation: () => ({
                then: () => {}
            }),
            getStaff: () => ({
                then: () => {}
            }),
        };
        vm = new IrfIndiaController(IndiaService);
    });

    describe('function setValuesForOtherInputs', () => {
        beforeEach(() => {
            vm.questions = {
                4: {
                    question_id: DateTimeId,
                    response: {
                        value: ''
                    }
                },
                31: {
                    question_id: OtherRedFlagId,
                    response: {
                        value: false
                    }
                },
                92: {
                    question_id: OtherSignId,
                    response: {
                        value: false
                    }
                },
                134: {
                    question_id: OtherSignId,
                    response: {
                        value: false
                    }
                },
                244: {
                    question_id: OtherWebsiteId,
                    response: {
                        value: false
                    }
                },
                134: {
                    question_id: OTHER_SIGN_ID,
                    response: {
                        value: false
                    }
                }
            };
        });

        it('should set other flags', () => {
            vm.setValuesForOtherInputs();

            expect(vm.otherRedFlag).toEqual(false);
            expect(vm.otherWebsite).toEqual(false);
            expect(vm.otherSign).toEqual(false);
        });

        it('when other red flag is false should set value to empty string', () => {
            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherRedFlagId].response.value).toEqual('');
        });

        it('when other website flag is false should set value to empty string', () => {
            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherWebsiteId].response.value).toEqual('');
        });

        it('when other sign flag is false should set value to empty string', () => {
            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherSignId].response.value).toEqual('');
        });

        it('when other sign flag is false should set value to empty string', () => {
            vm.setValuesForOtherInputs();

            expect(vm.questions[OTHER_SIGN_ID].response.value).toEqual('');
        });

        it('when other red flag is not false should set leave value as is', () => {
            vm.questions[OtherRedFlagId].response.value = 'hello there I am a red flag';

            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherRedFlagId].response.value).toEqual('hello there I am a red flag');
        });

        it('when other sign flag is not false should set leave value as is', () => {
            vm.questions[OtherSignId].response.value = 'I am another sign flag';

            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherSignId].response.value).toEqual('I am another sign flag');
        });

        it('when other website flag is not false should set leave value as is', () => {
            vm.questions[OtherWebsiteId].response.value = 'I am another website flag';

            vm.setValuesForOtherInputs();

            expect(vm.questions[OtherWebsiteId].response.value).toEqual('I am another website flag');
        });
    });

    describe('function setContactRadio', () => {
        beforeEach(() => {
            vm.questions = {
                92: {
                    question_id: OtherContactId,
                    response: {
                        value: ''
                    }
                }
            };
        });

        it('when contactValue matches an item in Contacts or is null string leave it as contactValue', () => {
            vm.setContactRadio();

            expect(vm.contactValue).toEqual('');
            expect(vm.otherContactString).toEqual('');
        });

        it('when contactValue does not match one of contacts, change contactValue to other and otherContactString to string value', () => {
            vm.questions[OtherContactId].response.value = 'I am another contact';

            vm.setContactRadio();

            expect(vm.otherContactString).toEqual('I am another contact');
            expect(vm.contactValue).toEqual('Other');
        });

        it('when other sign flag is not false should set leave value as is', () => {
            vm.questions[OTHER_WEBSITE_ID].response.value = 'I am another sign flag';

            vm.setValuesForOtherInputs();

            expect(vm.questions[OTHER_WEBSITE_ID].response.value).toEqual('I am an other sign flag');
        });
    });

    describe('function setContact', () => {
        const OTHER_CONTACT_ID = 92;

        beforeEach(() => {
            vm.questions = {
                134: {
                    question_id: OTHER_CONTACT_ID,
                    response: {
                        value: false
                    }
                }
            };
        });

        it('when contactValue matches an item in Contacts or is null string leave it as contactValue', () => {
            vm.setContact();

            expect(vm.contactValue).toEqual('');
            expect(vm.otherContactString).toEqual('');
        });

        it('when contactValue does not match one of contacts, change contactValue to other and otherContactString to string value', () => {
            vm.questions[OTHER_CONTACT_ID].response.value = 'I am another contact';

            vm.setContact();

            expect(vm.otherContactString).toEqual('I am another contact');
            expect(vm.contactValue).toEqual('other');

        });
    });
});