

/* global angular */

export default class AuditSampleListController {
    constructor(AuditService, SessionService, SpinnerOverlayService, StickyHeader, $state, $stateParams, $uibModal, $timeout,  toastr, constants) {
        'ngInject';
        this.service = AuditService;
        this.session = SessionService;
        this.stateParams = $stateParams;
        this.modal = $uibModal;
        this.sticky = StickyHeader;
        this.spinnerOverlayService = SpinnerOverlayService;
        this.state = $state;
        this.timeout = $timeout;
        this.toastr = toastr;
        this.constants = constants;
        this.isViewing = true;
        this.digits1Format = {'minimumFractionDigits': 1, 'maximumFractionDigits': 1};

        this.completionStatus="";
        this.queryParameters = {
            "audit_id": this.stateParams.auditId,
            "page_size": 20,
            "reverse": false,
            "ordering": 'form_number',
            "search": '',
        };
        this.paginate = {
            items:0,
            pageSize:this.queryParameters.page_size,
            currentPage:1,
        };
        
        this.stickyOptions = this.sticky.stickyOptions;
        this.stickyOptions.zIndex = 1;

        this.showPage(1);
        this.getAudit(this.stateParams.auditId);
    }
    
    getAccuracy(total, incorrect) {
        let result = '-';
        if (total && total > 0) {
            result = Math.floor((total - incorrect) * 1000 / total)/10;
        }
        return result;
    }
    
    getAudit(auditId) {
        this.service.getAudit(auditId).then((promise) => {
            this.audit = promise.data;
            let questions = 0;
            for (let idx=0; idx < this.audit.template.length; idx++) {
                if (this.audit.template[idx].questions) {
                    questions += this.audit.template[idx].questions;
                }
            }
            this.audit.question_count = questions;
            this.isViewing = !this.session.checkPermission('AUDIT','SUBMIT_SAMPLE', this.audit.country, null);
        });
    }
    
    getOverallAccuracy() {
        let result = '-';
        let totalQuestions = this.audit.samples_complete * this.audit.question_count;
        if (totalQuestions > 0) {
            result = Math.floor((totalQuestions - this.audit.total_incorrect) * 1000 / totalQuestions)/10;
        }
        return result;
    }
    
    getFormsPassed() {
        let result = '-';
        if (this.audit.samples_complete > 0) {
            result = Math.floor(this.audit.samples_passed * 1000 / this.audit.samples_complete)/10;
        }
        return result;
    }
    
    transform(queryParameters, pageNumber) {
        var queryParams = angular.copy(queryParameters);
        queryParams.page = pageNumber;
        if (this.completionStatus !== '') {
            queryParams.completed = this.completionStatus;
        }
        var params = [];
        Object.keys(queryParams).forEach(name => {
            if (queryParams[name] !== null && queryParams[name] !== '') {
                params.push({ name: name, value: queryParams[name] });
            }
        });
        return params;
    }
    
    parameterChange() {
        this.showPage(1)
    }
    
    showPage(pageNumber) {
        this.spinnerOverlayService.show("Searching for Audit Samples...");        
        this.service.getAuditSampleList(this.transform(this.queryParameters, pageNumber)).then( (promise) => {
            this.auditSamples= promise.data.results;
            this.paginate.items = promise.data.count;
            this.paginate.currentPage = pageNumber;
            this.spinnerOverlayService.hide();
            for (let idx=0; idx < this.auditSamples.length; idx++) {
                let sample = this.auditSamples[idx];
                sample.url = this.state.href('auditSample', {
                    auditId: this.queryParameters.audit_id,
                    id: sample.id
                });
                sample.incorrect = 0;
                for (let key in sample.results) {
                    if (sample.results[key]) {
                        sample.incorrect += sample.results[key];
                    }
                }
            }   
        }, () => {this.spinnerOverlayService.hide();});
    }
    
    updateNotes() {
        this.service.updateNotes(this.audit).then(() => {
        }, (error)=>{alert(error);});
    }
}
