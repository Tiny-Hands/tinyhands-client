import {BaseCifController} from '../baseCifController.js';
import {CifModalController} from '../cifModalController.js';
import {AssociatedPersonModalController} from '../associatedPersonModalController.js';
import './india.less';

import templateUrl from './india.html';
import topTemplate from './step-templates/top.html';
import mainPvTemplate from './step-templates/mainPv.html';
import pvsTemplate from '../common/step-templates/potentialVictims/potentialVictims.html';
import recruitmentTemplate from './step-templates/recruitment.html';
import travelTemplate from './step-templates/travel.html';
import tbsTemplate from '../common/step-templates/transportationBoxes/transportationBoxes.html';
import legalTemplate from './step-templates/legal.html';
import pbsTemplate from '../common/step-templates/personBoxes/personBoxes.html';
import lbsTemplate from '../common/step-templates/locationBoxes/locationBoxes.html';
import vbsTemplate from '../common/step-templates/vehicleBoxes/vehicleBoxes.html';
import finalTemplate from './step-templates/final.html';
import attachmentsTemplate from '../common/step-templates/attachments/attachment.html';
import logbookTemplate from '../common/step-templates/logbook.html';

import potentialVictimModalTemplate from '../common/step-templates/potentialVictims/potentialVictimModal.html';
import transportationBoxModalTemplate from '../common/step-templates/transportationBoxes/transportationBoxModal.html';
import personBoxTemplate from './step-templates/personBoxes/personBoxModal.html';
import locationBoxTemplate from './step-templates/locationBoxes/locationBoxModal.html';
import vehicleBoxTemplate from '../common/step-templates/vehicleBoxes/vehicleBoxModal.html';
import attachmentTemplate from '../common/step-templates/attachments/attachmentModal.html';

export class CifIndiaController extends BaseCifController {
    constructor($scope, $uibModal, constants, CifService, $stateParams, $state, $timeout, IrfService,  SpinnerOverlayService, $uibModalStack, SessionService, BaseUrlService) {
        'ngInject';        
        super($scope, $uibModal, constants, CifService, $stateParams, $state, $timeout, IrfService,  SpinnerOverlayService, $uibModalStack, SessionService, BaseUrlService);
       
        this.stepTemplates = [
            {template:topTemplate, name:"Top"},
            {template:mainPvTemplate, name:"Potential Victim"},
            {template:pvsTemplate, name:"Other PVs"},
            {template:recruitmentTemplate, name:"Recruitment"},
            {template:travelTemplate, name:"Travel"},
            {template:tbsTemplate, name:"Transportation"},
            {template:legalTemplate, name:"Legal"},
            {template:pbsTemplate, name:"Person Boxes"},
            {template:lbsTemplate, name:"Location Boxes"},
            {template:vbsTemplate, name:"Vehicle Boxes"},
            {template:finalTemplate, name:"Final"},
            {template:attachmentsTemplate, name:"Attachments"},
            {template:logbookTemplate, name:"Compliance"},
        ];
    }
    
    getDefaultIdentificationTypes() {
        return ['Passport', 'Other ID#'];
    }
    
    openPotentialVictimModal(responses = [], isAdd = false, idx=null) {
    	this.commonModal(responses, isAdd, idx, AssociatedPersonModalController, 'PotentialVictimModalController',
    			potentialVictimModalTemplate, 'OtherPotentialVictims');
    }
    
    openTransportationBoxModal(responses = [], isAdd = false, idx=null) {
    	this.commonModal(responses, isAdd, idx, CifModalController, 'TransportationBoxModalController',
    			transportationBoxModalTemplate, 'Transportations');
    }
    
    openPersonBoxModal(responses = [], isAdd = false, idx=null) {
    	this.commonModal(responses, isAdd, idx, AssociatedPersonModalController, 'PersonBoxModalController',
    			personBoxTemplate, 'PersonBoxes');
    }
    
    openLocationBoxModal(responses = [], isAdd = false, idx=null) {
    	this.commonModal(responses, isAdd, idx, CifModalController, 'LocationBoxModalController',
    			locationBoxTemplate, 'LocationBoxes');
    }
    
    openVehicleBoxModal(responses = [], isAdd = false, idx=null) {
    	this.commonModal(responses, isAdd, idx, CifModalController, 'VehicleBoxModalController',
    			vehicleBoxTemplate, 'VehicleBoxes');
    }
    
    openAttachmentModal(responses = [], isAdd = false, idx=null) {
        this.commonModal(responses, isAdd, idx, CifModalController, 'AttachmentModalController',
                attachmentTemplate, 'Attachments');
    }
}

export default {
    templateUrl,
    controller: CifIndiaController
};
