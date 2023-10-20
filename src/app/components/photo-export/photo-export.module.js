import sharedModule from '../../shared/shared.module';
import PhotoExportController from './photo-export.controller';
import PhotoExportModalController from './photo-export-modal.controller';
import PhotoExportDirective from './photo-export.directive';
import PhotoExportComponent from './photo-export.component';

export default angular.module('tinyhands.PhotoExport', [sharedModule])
    .controller('PhotoExportController', PhotoExportController)
    .controller('PhotoExportModalController', PhotoExportModalController)
    .directive('photoexport', PhotoExportDirective)
    // To wrap for react in angular2React, we must use an Angular 1.5 component)
    .component('photoexportComponent', PhotoExportComponent)
    .name;
