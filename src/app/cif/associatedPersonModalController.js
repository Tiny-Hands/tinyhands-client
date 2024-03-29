import {CifModalController} from './cifModalController.js';

const CheckboxGroup = require('../checkboxGroup.js');

class AssociatedPersonModalController extends CifModalController {
    constructor($uibModalInstance, constants, $scope, isAdd, card, isViewing, modalActions, config, parentController, identificationTypes, associatedPersons, checkboxGroupItems) {
        'ngInject';
        super($uibModalInstance, $scope, constants, isAdd, card, isViewing, modalActions, config, parentController, identificationTypes);
        
        this.constants = constants; 
        this.associatedPersons = associatedPersons;
        this.checkboxGroupItems = checkboxGroupItems;
        this.checkboxGroup = new CheckboxGroup();
        this.checkboxGroupItems = checkboxGroupItems;
    }
    
    subclassDelayedQuestionData() {
        for (let idx=0; idx < this.checkboxGroupItems.length; idx++) {
            this.checkboxGroup.checkboxItem(this.checkboxGroupItems[idx].group, this.checkboxGroupItems[idx].option);
        }
        
        this.checkboxGroup.initOriginalValues(this.questions);
    }
    
    subclassSave() { 
        this.checkboxGroup.updateResponses();
    }
}

export {AssociatedPersonModalController};