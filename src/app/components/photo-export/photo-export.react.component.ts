import { angular2react } from 'angular2react'
import PhotoExportComponent from "./photo-export.component";
import {lazyInjector} from "../../lazyInjector";

// No bindings
const PhotoExportReact = angular2react('photoexportComponent', PhotoExportComponent, lazyInjector.$injector)

export { PhotoExportReact }