import sharedModule from '../shared/shared.module';
import IrfIndiaModule from './india/irf.india.module';
import IrfNepalModule from './nepal/irf.nepal.module';
import IrfSouthAfricaModule from './south-africa/irf.southAfrica.module';

import IrfRoutes from './irf.route';

import IrfListController from './list/irfList.controller';

import IrfListService from './list/irfList.service';

import IrfNewListController from './newList/irfNewList.controller';
import CreateIrfModalController from './newList/createIrfModal.controller';

import IrfNewListService from './newList/irfNewList.service';

export default angular.module('tinyhands.IRF', [IrfIndiaModule, IrfNepalModule, IrfSouthAfricaModule, sharedModule])
    .config(IrfRoutes)
    .controller('IrfListController', IrfListController)
    .service('IrfListService', IrfListService)
    .controller('IrfNewListController', IrfNewListController)
    .controller('CreateIrfModalController', CreateIrfModalController)
    .service('IrfNewListService', IrfNewListService)
    .name;