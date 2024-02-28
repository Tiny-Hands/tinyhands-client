/*global FormData */
export default class BorderStationService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getStaff(id) {
    	if (id) {
    		return this.service.get(`api/staff/${id}/?include=miscellaneous`);
    	} else {
    		return this.service.get(`api/staff/blank/?include=miscellaneous`);
    	}
    }
    
	getStaffList(queryParameters) {
		return this.service.get('api/staff/', queryParameters);
	}
	
	submitStaff(staff) {
		if (staff.id === null) {
			return this.service.post(`api/staff/`, staff);
		} else {
			return this.service.put(`api/staff/${staff.id}/`, staff);
		}
	}
	
	
	submitMiscellaneous(miscellaneous) {
		if (miscellaneous.id === null) {
			return this.service.post('api/staff/miscellaneous/', miscellaneous);
		} else {
			return this.service.put(`api/staff/miscellaneous/${miscellaneous.id}/`, miscellaneous);
		}
	}
	
	getStaffContract(id) {
		return this.service.get(`api/staff/contract/${id}/`);
	}
	
	appendFile(formData, staff, baseLabel, file_obj) {
		if (file_obj === null) {
			return;
		}
		
		let fileName = baseLabel + '_' + staff.first_name + '_' + staff.last_name + '_' + (new Date()).getTime();
		fileName = fileName.replace(' & ','-')
		fileName = fileName.replace(' ','-')
		fileName = fileName.replace(',','-')
		let t = Object.prototype.toString.call(file_obj);
        if (t === '[object Blob]') {
        	let origFile = file_obj.$ngfName;
        	let lastIdx = origFile.lastIndexOf('.');
        	if (lastIdx >= 0) {
        		fileName += origFile.substring(lastIdx);
        	}
            formData.append('attachment_file', file_obj, fileName);
        } else if (t === '[object File]') {
        	let origFile = file_obj.name;
        	let lastIdx = origFile.lastIndexOf('.');
        	if (lastIdx >= 0) {
        		fileName += origFile.substring(lastIdx);
        	}
        	formData.append('attachment_file', file_obj, fileName);
        }
	}
	
	saveStaffContract(staff, contract) {
		let formData = new FormData();
		formData.append("contract", JSON.stringify(contract));
		this.appendFile(formData, staff, 'contract', contract.contract);
		this.appendFile(formData, staff, 'agreement', contract.agreement);
		return this.service.put(`api/staff/contract/${contract.id}/`, formData, {'Content-Type': undefined});
	}
	
	getAttachments(staff) {
	    return this.service.get(`api/staff/attachment/?staff_id=${staff.id}`);
	}
	
	saveAttachment(staff, attachment) {
	    let formData = new FormData();
        formData.append("attachment", JSON.stringify(attachment));
        this.appendFile(formData, staff, attachment.option, attachment.attachment);
        if (attachment.id !== null) {
            return this.service.put(`api/staff/attachment/${attachment.id}/`, formData, {'Content-Type': undefined});
        } else {
            return this.service.post(`api/staff/attachment/`, formData, {'Content-Type': undefined});
        }
	}
	
	deleteAttachment(attachment) {
	    return this.service.delete(`api/staff/attachment/${attachment.id}/`);  
	}
	
	getContractRequests(staff, year, month) {
		return this.service.get(`api/staff/contract/requests/${staff.id}/${year}/${month}/`);
	}
	
	getStaffKnowledge(id) {
    	return this.service.get(`api/staff/knowledge/${id}/`);
    }
    
    saveStaffKnowledge(staff, knowledge) {
    	return this.service.put(`api/staff/knowledge/${staff.id}/`, knowledge);
    }
	
	getUserCountries(id) {
        return this.service.get(`api/user_permission/countries/${id}/?permission_group=STAFF`);
    }
    
    getUserStations(id) {
        let params = [];
      
        params.push({name: 'permission_group', value: 'STAFF'});
        params.push({name: 'action', value: 'VIEW_BASIC'});

        return this.service.get(`api/user_permission/stations/${id}/`, params);
    }
    
    getStaffReviewList(staffId) {
    	return this.service.get(`api/staff-review/?staff_id=${staffId}`);
    }
    
    submitStaffReview(review) {
    	if (review.id === null) {
    		return this.service.post(`api/staff-review/`, review);
    	} else {
    		return this.service.put(`api/staff-review/${review.id}/`, review);
    	}
    }
    
    deleteStaffReview(review) {
    	return this.service.delete(`api/staff-review/${review.id}/`);
    }
    
    getAllBorderStations() {
        return this.service.get('api/border-station/');
    }
  
}
