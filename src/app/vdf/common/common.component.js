import {BaseVdfController} from '../baseVdfController.js';
import {BaseModalController} from '../../baseModalController.js';
import './common.less';

import templateUrl from './common.html';
import topTemplate from './step-templates/top.html';
import victimTemplate from './step-templates/victim.html';
import homeAssessmentTemplate from './step-templates/homeAssessment.html';
import awarenessTemplate from './step-templates/awareness.html';
import releaseTemplate from './step-templates/release.html';
import finalTemplate from './step-templates/final.html';
import attachmentsTemplate from './step-templates/attachments/attachment.html';
import logbookTemplate from './step-templates/logbook.html';

import attachmentTemplate from './step-templates/attachments/attachmentModal.html';

export class VdfCommonController extends BaseVdfController {
    constructor($scope, $uibModal, constants, VdfService, $stateParams, $state) {
        'ngInject';        
        super($scope, $uibModal, constants, VdfService, $stateParams, $state);
       
        this.stepTemplates = [
            topTemplate,
            victimTemplate,
            homeAssessmentTemplate,
            awarenessTemplate,
            releaseTemplate,
            finalTemplate,
            attachmentsTemplate,
            logbookTemplate
        ];
    }
    
    openAttachmentModal(responses = [], isAdd = false, idx=null) {
        this.commonModal(responses, isAdd, idx, BaseModalController, 'AttachmentModalController',
                attachmentTemplate, 'Attachments');
    }
}

export default {
    templateUrl,
    controller: VdfCommonController
};
