import sharedModule from '../shared/shared.module';
import IrfBangladeshModule from './bangladesh/irf.bangladesh.module';
import IrfIndiaModule from './india/irf.india.module';
import IrfMalawiModule from './malawi/irf.malawi.module';
import IrfNepalModule from './nepal/irf.nepal.module';
import IrfSouthAfricaModule from './south-africa/irf.southAfrica.module';
import IrfBeninModule from './benin/irf.benin.module';
import IrfUgandaModule from './uganda/irf.uganda.module';
import IrfKenyaModule from './kenya/irf.kenya.module';
import IrfTanzaniaModule from './tanzania/irf.tanzania.module';
import IrfGhanaModule from './ghana/irf.ghana.module';
import IrfSierraLeoneModule from './sierra-leone/irf.sierraLeone.module';
import IrfCambodiaModule from './cambodia/irf.cambodia.module';
import IrfZimbabweModule from './zimbabwe/irf.zimbabwe.module';
import IrfRwandaModule from './rwanda/irf.rwanda.module';
import IrfIndiaNetworkModule from './indiaNetwork/irf.indiaNetwork.module';
import IrfNamibiaModule from './namibia/irf.namibia.module';
import IrfNamibiaAirModule from './namibia-air/irf.namibiaAir.module';
import IrfUsaModule from './usa/irf.usa.module';
import IrfIndonesiaModule from './indonesia/irf.indonesia.module';
import IrfLesothoModule from './lesotho/irf.lesotho.module';
import IrfMozambiqueModule from './mozambique/irf.mozambique.module';
import IrfLiberiaModule from './liberia/irf.liberia.module';
import IrfBurkinaFasoModule from './burkinaFaso/irf.burkinaFaso.module';
import IrfZambiaModule from './zambia/irf.zambia.module';
import IrfBurundiModule from './burundi/irf.burundi.module';
import IrfEcuadorModule from './ecuador/irf.ecuador.module';
import IrfEthiopiaModule from './ethiopia/irf.ethiopia.module';
import IrfsfeNepalModule from './sfeNepal/irf.sfeNepal.module';
import IrfArgentinaModule from './argentina/irf.argentina.module';
import IrfPhilippinesModule from './philippines/irf.philippines.module';

import IrfRoutes from './irf.route';
import IrfService from './irf.service';

import IrfListController from './list/irfList.controller';

import IrfListService from './list/irfList.service';

import IrfNewListController from './newList/irfNewList.controller';
import CreateIrfModalController from './newList/createIrfModal.controller';
import AttachmentExportModalController from './newList/attachmentExportModal.controller';

import IrfNewListService from './newList/irfNewList.service';

/* global angular */

export default angular.module('tinyhands.IRF', [IrfIndiaModule, IrfNepalModule, IrfSouthAfricaModule,
    IrfBangladeshModule, IrfMalawiModule, IrfBeninModule, IrfUgandaModule, IrfKenyaModule, 
    IrfTanzaniaModule, IrfGhanaModule, IrfSierraLeoneModule, IrfCambodiaModule, IrfZimbabweModule, IrfRwandaModule, 
    IrfNamibiaModule, IrfNamibiaAirModule, IrfIndiaNetworkModule, IrfUsaModule, IrfIndonesiaModule, IrfLesothoModule, IrfMozambiqueModule,
    IrfLiberiaModule, IrfBurkinaFasoModule, IrfZambiaModule, IrfBurundiModule, IrfEcuadorModule, IrfEthiopiaModule, IrfsfeNepalModule,
    IrfArgentinaModule, IrfPhilippinesModule, sharedModule])
    .config(IrfRoutes)
    .controller('IrfListController', IrfListController)
    .service('IrfListService', IrfListService)
    .controller('IrfNewListController', IrfNewListController)
    .controller('CreateIrfModalController', CreateIrfModalController)
    .controller('AttachmentExportModalController', AttachmentExportModalController)
    .service('IrfNewListService', IrfNewListService)
    .service('IrfService', IrfService)
    .name;