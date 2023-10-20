import {angular2react} from "angular2react";
import {lazyInjector} from "../../lazyInjector";
import PaginateComponent from "./paginate.component";

type PaginateComponentReactProps = {
    pageControl: any;
    showPage: any;
}

const PaginateComponentReact = angular2react<PaginateComponentReactProps>(
    'paginateComponent', PaginateComponent, lazyInjector.$injector);
export { PaginateComponentReact }