import {BaseLfController} from '../baseLfController.js';
import {BaseModalController} from '../../baseModalController.js';
import './commonV2022_6.less';
const CheckboxGroup = require('../../checkboxGroup.js');

import templateUrl from './commonV2022_6.html';

import topTemplate from './step-templates/top.html';
import locationInformationTemplate from './step-templates/locationInformation.html';
import associationsTemplate from './step-templates/associations/association.html';
import narrativeTemplate from './step-templates/narrative.html';
import attachmentsTemplate from './step-templates/attachments/attachment.html';

import attachmentTemplate from './step-templates/attachments/attachment-modal.html';
import associationTemplate from './step-templates/associations/association-modal.html';

export class LfCommonV2022_6Controller extends BaseLfController {
    constructor($scope, $uibModal, LfService, $stateParams, $state, SpinnerOverlayService, $uibModalStack, SessionService, IncidentService, $timeout) {
        'ngInject';        
        super($scope, $uibModal, LfService, $stateParams, $state, SpinnerOverlayService, $uibModalStack, SessionService, IncidentService, $timeout);

        this.stepTemplates = [
            {template:topTemplate,name:'Top Box'},
            {template:locationInformationTemplate,name:'Location Information'},
            {template:associationsTemplate, name:'Associations'},
            {template:narrativeTemplate, name:'Narrative'},
            {template:attachmentsTemplate,name:'Attachments'},
        ];
        
        this.checkboxGroupInfo = new CheckboxGroup();
        //'Recruiter','Transporter','Master','Facilitator','Boss Trafficker', 'Host'
        this.role = [
        	{
                value:"Recruiter",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
            {
                value:"Transporter",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
            {
                value:"Master",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
            {
                value:"Facilitator",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
            {
                value:"Boss Trafficker",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
            {
                value:"Host",
                type:'checkbox-group',
                format:'col-md-4',
                points:0
            },
        ];
        for (let idx in this.role) {
        	if (this.role[idx].type === 'checkbox-group') {
        		this.checkboxGroupInfo.checkboxItem('lfTopMergedPerson-role', this.role[idx].value);
        	}
        }
        
        this.legalDateData = ['lfLegalArrestDate', 'lfLegalChargeSheetDate', 'lfLegalLocationLastDate'];
        this.legalCheckboxGroupQuestions = {
        	lfLegalPvUnable:[
		        	{
		                value:"No:",
		                type:'checkbox-group'
		            },
		            {
		                value:"PV afraid for reputation",
		                type:'checkbox-group'
		            },
		            {
		                value:"PV afraid for their safety",
		                type:'checkbox-group'
		            },
		            {
		                value:"PVs don't believe they were being trafficked",
		                type:'checkbox-group'
		            },
		            {
		                value:"PV family not willing",
		                type:'checkbox-group'
		            },
		            {
		                value:"Couldn't reestablish contact with PV",
		                type:'checkbox-group'
		            },
		        ],
		    lfLegalLocationUnable:[
		        	{
		                value:"Insufficient Suspect Bio Details",
		                type:'checkbox-group'
		            },
		            {
		                value:"Current Location Unknown",
		                type:'checkbox-group'
		            },
		            {
		                value:'Last Known Location',
		                type:'checkbox-group'
		            },
		        ],
		    lfLegalPoliceUnable:[
		        	{
		                value:"No",
		                type:'checkbox-group',
		            },
		            {
		                value:"Police say not enough evidence",
		                type:'checkbox-group',
		            },
		            {
		                value:'Other Reason:',
		                type:'other-checkbox-group',
		            },
		        ]
		}
    }
    
    getInfoCardConfig() {
    	let infoCard = {
        	dateQuestions: [{tag:'lfInformationPerson', type:'person'},{tag:'lfInformationInterviewDate', type:'basic'}],
        	otherQuestions: [{
        	    tag: 'lfInformationSourceType',
        	    radioItems:['Intercept','Operation','Victim','Police','Trafficker','OSI']}],
        	checkboxGroupQuestions: [
				{tag:'lfInformationPerson-role', items:['Recruiter','Transporter','Master','Facilitator','Boss Trafficker', 'Host']}]
        };
        return infoCard;
    }
    
    getLfComplete() {
    }
    
    resetCheckboxGroupInfo() {
    	this.checkboxGroupInfo.initOriginalValues(this.questions);
    }
    
    switchTab() {
        this.informationCardChange();   // update the master suspect information
    }
    
    saveExtra() {
    }
    
    submitExtra() {
    }

    openAttachmentModal(responses = [], isAdd = false, idx=null) {
        this.commonModal(responses, isAdd, idx, BaseModalController, 'AttachmentModalController',
                attachmentTemplate, 'Attachments');
    }
}

export default {
    templateUrl,
    controller: LfCommonV2022_6Controller
};
