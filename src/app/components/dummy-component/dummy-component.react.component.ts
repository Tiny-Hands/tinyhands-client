import {angular2react} from "angular2react";
import {lazyInjector} from "../../lazyInjector";
import DummyComponent from "./dummy-component.component";
import * as React from "react";

type DummyAngularComponentWrappedProps = {
    thingThing: string;
    callback: () => void;
}

let DummyAngularComponentWrapped = angular2react<DummyAngularComponentWrappedProps>(
    'dummyComponent', DummyComponent, lazyInjector.$injector);
export { DummyAngularComponentWrapped }