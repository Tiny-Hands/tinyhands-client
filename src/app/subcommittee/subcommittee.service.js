/*global FormData */
export default class BorderStationService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }
    
    getSubcommittee(id) {
    	if (id) {
    		return this.service.get(`api/committee-member/${id}/`);
    	} else {
    		return this.service.get(`api/committee-member/blank/`);
    	}
    }
    
	getSubcommitteeList(queryParameters) {
		return this.service.get('api/committee-member/', queryParameters);
	}
	
	submitSubcommittee(member) {
		let formData = new FormData();
		formData.append("member", JSON.stringify(member));
		this.appendFile(formData, member, 'sc_agreement', member.sc_agreement);
		this.appendFile(formData, member, 'misconduct_agreement', member.misconduct_agreement);
		if (member.id === null) {
			return this.service.post(`api/committee-member/`, formData, {'Content-Type': undefined});
		} else {
			return this.service.put(`api/committee-member/${member.id}/`,formData, {'Content-Type': undefined});
		}
	}
	
	appendFile(formData, staff, baseLabel, file_obj) {
		if (file_obj === null) {
			return;
		}
		
		let fileName = baseLabel + '_' + staff.first_name + '_' + staff.last_name + '_' + staff.id;
		let t = Object.prototype.toString.call(file_obj);
        if (t === '[object Blob]') {
        	let origFile = file_obj.$ngfName;
        	let lastIdx = origFile.lastIndexOf('.');
        	if (lastIdx >= 0) {
        		fileName += origFile.substring(lastIdx);
        	}
            formData.append(baseLabel+'_file', file_obj, fileName);
        } else if (t === '[object File]') {
        	let origFile = file_obj.name;
        	let lastIdx = origFile.lastIndexOf('.');
        	if (lastIdx >= 0) {
        		fileName += origFile.substring(lastIdx);
        	}
        	formData.append(baseLabel+'_file', file_obj, fileName);
        }
	}
	
	deleteSubcommittee(member) {
		return this.service.delete(`api/committee-member/${member.id}/`);
	}
	
	
	getUserCountries(id) {
        return this.service.get(`api/user_permission/countries/${id}/?permission_group=SUBCOMMITTEE`);
    }
    
    getUserStations(id) {
        let params = [];
      
        params.push({name: 'permission_group', value: 'SUBCOMMITTEE'});
        params.push({name: 'action', value: 'VIEW_BASIC'});
        params.push({name: 'include_closed', value: true})

        return this.service.get(`api/user_permission/stations/${id}/`, params);
    }
    
    getAllBorderStations() {
        return this.service.get('api/border-station/');
    }
}
