// This takes the place of most directive.js file in Angular 1.5

import photoExportTemplate from './photo-export.html';
import PhotoExportController from "./photo-export.controller";

const PhotoExportComponent = {
    bindings: {},
    // This could be a breaking change.
    // I had to change template to templateUrl for some reason
    // However, on my local irfNew still seems to be working
    templateUrl: photoExportTemplate,
    controller: PhotoExportController
}

export default PhotoExportComponent