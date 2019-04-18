import {BaseIrfController} from '../baseIrfController.js';
import {BaseModalController} from '../../baseModalController.js';
import './southAfrica.less';

import templateUrl from './southAfrica.html';
import topBoxTemplate from './step-templates/topBox.html';
import visualTemplate from './step-templates/visual.html';
import documentationTemplate from './step-templates/documentation.html';
import interviewTemplate from './step-templates/interview.html';
import hostTemplate from './step-templates/host.html';
import childrenTemplate from './step-templates/children.html';
import sourceTemplate from './step-templates/source.html';
import intercepteesTemplate from './step-templates/interceptees/interceptees.html';
import finalProceduresTemplate from './step-templates/finalProcedures.html';
import attachmentsTemplate from './step-templates/attachments/attachment.html';

import IntercepteeModalController from '../intercepteeModal.controller';
import intercepteeModalTemplate from './step-templates/interceptees/intercepteeModal.html';
import attachmentTemplate from './step-templates/attachments/attachmentModal.html';

export class IrfSouthAfricaController extends BaseIrfController {
    constructor($scope, $uibModal, constants, IrfService, $stateParams, $state) {
        'ngInject';
        super($scope, $uibModal, constants, IrfService, $stateParams, $state);
        
        
        this.stepTemplates = [
        	topBoxTemplate,
        	visualTemplate,
        	documentationTemplate,
        	interviewTemplate,
        	hostTemplate,
        	childrenTemplate,
        	sourceTemplate,
        	intercepteesTemplate,
        	finalProceduresTemplate,
        	attachmentsTemplate];
    }
    
    getIdentificationType() {
        return "Passport";
    }

    openIntercepteeModal(card, isAdd = false, idx = null) {
    	this.commonModal(card, isAdd, idx, IntercepteeModalController,'IntercepteeModalController',
    			intercepteeModalTemplate, 'Interceptees');
    }
    
    openAttachmentModal(responses = [], isAdd = false, idx=null) {
        this.commonModal(responses, isAdd, idx, BaseModalController, 'AttachmentModalController',
                attachmentTemplate, 'Attachments');
    }
}

export default {
    templateUrl,
    controller: IrfSouthAfricaController,
};