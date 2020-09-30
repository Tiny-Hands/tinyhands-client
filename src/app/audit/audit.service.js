
export default class AuditService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getAudit(id) {
        return this.service.get(`api/audit/${id}/`);
    }
    
    submitAudit(audit) {
        if (audit.id === null) {
            return this.service.post(`api/audit/`, audit);
        } else {
            return this.service.put(`api/audit/${audit.id}/`, audit);
        }
    }
    
    getUserCountries(id) {
        return this.service.get(`api/user_permission/countries/${id}/?permission_group=AUDIT`);
    }
    
    getFormTypes() {
        return this.service.get('api/forms/types/');
    }
    
    getForms() {
        return this.service.get('api/forms/');
    }
    
    getAuditList(queryParameters) {
        return this.service.get('api/audit/', queryParameters);
    }
    
    getFormConfig(formName) {
        return this.service.get(`api/forms/config/${formName}/`);
    }
    
    getFormCountries(formId) {
        return this.service.get(`api/forms/countries/${formId}/`);
    }
    
    getAuditSampleList(auditId) {
        return this.service.get(`api/audit-sample/?audit_id=${auditId}&page_size=1000`);
    }
    
    getAuditSample(id) {
        return this.service.get(`api/audit-sample/${id}/`);
    }
    
    submitAuditSample(auditSample) {
        return this.service.put(`api/audit-sample/${auditSample.id}/`, auditSample);
    }
}