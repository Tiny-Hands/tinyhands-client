import dummyComponentTemplate from "./dummy-component.html";


class DummyComponentController {
}

const DummyComponent = {
    bindings: {
        // Be careful what you name these!
        // I lost a few hours because I named this "dataThing" and it was silently wiped out
        // I think because <select data-ng-model="" /> consumes all directives starting with data-xxx
        //  and behind the scenes angular sees it as data-thing
        thingThing: '<',
        callback: '<'
    },
  templateUrl: dummyComponentTemplate,
  controller: DummyComponentController,
};

export default DummyComponent;