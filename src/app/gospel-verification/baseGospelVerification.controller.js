/* global alert */
import {BaseFormController} from '../baseFormController.js';

export class BaseGospelVerificationController extends BaseFormController {
    constructor($scope, GospelVerificationService, VdfService, $stateParams, $state, SpinnerOverlayService, $uibModalStack, SessionService) {
        'ngInject';
        super($scope, $stateParams, $uibModalStack);
        
        this.service = GospelVerificationService;
        this.vdfService = VdfService;
        this.state = $state;
        this.spinner = SpinnerOverlayService;
        this.session = SessionService;

        this.getGospelVerification(this.stateParams.countryId, this.stateParams.stationId, this.stateParams.id);
        this.getVdf(this.stateParams.countryId, this.stateParams.stationId, this.stateParams.vdf_id);
    }
    
    getGospelVerification(countryId, stationId, id) {
        this.service.getFormConfig(this.stateParams.formName).then ((response) => {
            this.config = response.data;
            this.service.getGospelVerification(countryId, stationId, id).then((response) => {
                this.processResponse(response);
            }, (error) => {alert(error);});
        });
    }

    getVdf(countryId, stationId, id) {
        this.service.getVdf(countryId, stationId, id).then((response) => {
            this.vdf = response.data;
            this.vdfQuestions = _.keyBy(response.data.responses, (x) => x.question_id);
            this.origVdf = {
                   675:this.vdfQuestions[675].response.value,
                   676:this.vdfQuestions[676].response.value
            };
            this.vdfUrl = this.state.href(response.data.form_name, 
                    {   id:response.data.storage_id, 
                        stationId:response.data.station_id, 
                        countryId:response.data.country_id, 
                        isViewing:true,
                        formName: response.data.form_name});
        });
    }
    
    updateChangeRequired() {
        if (this.questions[1060].response.value === 'Yes') {
            this.questions[1062].response.value = null;
            this.questions[1063].response.value = null;
            this.questions[1064].response.value = null;
            this.questions[1065].response.value = null;
        } else if (this.questions[1060].response.value === 'No') {
            this.questions[1061].response.value = null;
            this.vdfQuestions[676].response.value = 'Came to believe that Jesus is the one true God';
        }
    }

    // Override in subclass for implementation specific features
    submitExtra() {
    }

    submit() {
        if (this.origVdf[676] !== this.vdfQuestions[676].response.value) {
            this.service.updateGospelVdf(this.stateParams.vdf_id, this.vdfQuestions[676].response.value).then(
                    () => {
                    }, ()=>{
                        alert("Failed to update VDF");
                    }); 
        }
        if (!this.questions[1034].response.value) {
            this.questions[1034].response.value = this.session.user.first_name + ' ' + this.session.user.last_name;
        }
        if (!this.questions[1033].response.value) {
            this.dateData.questions[1033].value = new Date();
        }
        this.outCustomHandling();
        this.submitExtra();
        this.errorMessages = [];
        this.warningMessages = [];
        this.response.status = 'approved';
        if (this.ignoreWarnings) {
            this.response.ignore_warnings = 'True';
        } else {
            this.response.ignore_warnings = 'False';
        }
        this.service.submitGospelVerification(this.stateParams.stationId, this.stateParams.id, this.response).then((response) => {
             this.response = response.data;
             this.responses = response.data.responses;
             this.questions = _.keyBy(this.responses, x => x.question_id);
             this.setValuesForOtherInputs();
             if (this.stateParams.id === null) {
                 this.stateParams.id = response.data.id;
             }
             this.state.go('gospelVerificationList');
         }, (error) => {
             this.set_errors_and_warnings(error.data);
            });
        
        this.messagesEnabled = true;
    }
}

export default {
    BaseGospelVerificationController
};
