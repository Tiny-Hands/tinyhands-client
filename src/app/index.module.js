import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngCsv from 'ng-csv';
import ngFileUpload from 'ng-file-upload';
import ngSanitize from 'angular-sanitize';
import ngTouch from 'angular-touch';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-chips/dist/angular-chips.min.js';
import 'toastr/toastr.less';

import 'moment/moment.js';
import 'angularjs-bootstrap-datetimepicker/src/js/datetimepicker.js';
import 'angularjs-bootstrap-datetimepicker/src/js/datetimepicker.templates.js';
import 'angular-date-time-input/src/dateTimeInput.js';

import sharedModule from './shared/shared.module';
import accountModule from './account/account.module';
import budgetModule from './budget/budget.module';
import borderStationModule from './border-station/borderStation.module';
import addressesModule from './addresses/addresses.module';
import CIFModule from './cif/cif.module';
import collectionIndicatorsModule from './collectionIndicators/collectionIndicators.module';
import dashboardModule from './dashboard/dashboard.module';
import indicatorsModule from './indicators/indicators.module';
import loginModule from './login/login.module';
import MonthlyReportModule from './monthlyReport/monthlyReport.module';
import VDFModule from './vdf/vdf.module';
import VIFModule from './vif/vif.module';
import IRFModule from './irf/irf.module';
import photoExportModule from './components/photo-export/photo-export.module';
import countriesModule from './countries/countries.module';
import idmanagementModule from './idmanagement/idmanagement.module';
import personManagementModule from './personManagement/personManagement.module';
import traffickermatchModule from './traffickermatch/traffickermatch.module';
import relatedFormsModule from './relatedForms/relatedForms.module';
import helpModule from './help/help.module.js';
import operationsDashboardModule from './operationsDashboard/operationsDashboard.module';
import stationDataModule from './stationData/stationData.module';
import locationDataModule from './location-data/locationData.module';
import locationStaffModule from './location-staff/locationStaff.module';
import auditModule from './audit/audit.module';
import legalCaseModule from './legalCase/legalCase.module';
import gospelVerificationModule from './gospel-verification/gospelVerification.module';
import empModule from './emp/emp.module';
import gspModule from './gsp/gsp.module';
import pvfModule from './pvf/pvf.module';
import sfModule from './sf/sf.module';
import lfModule from './lf/lf.module';
import incidentModule from './incident/incident.module';
import staffModule from './staff/staff.module';
import projectRequestModule from './project-request/projectRequest.module';
import mdfModule from './mdf/mdf.module';
import subcommitteeModule from './subcommittee/subcommittee.module'
import formExportModule from './components/form-export/form-export.module';


import constants from './constants.js';
import config from './index.config';
import routerConfig from './index.route';
import httpProviderConfig from './httpProvider.config';

import NavbarDirective from './components/navbar/navbar.directive';
import CsvExportDirective from './components/csv-export/csv-export.directive';
import AutocompleteAddress1Directive from './components/auto-complete/address1/autocomplete-address1.directive';
import AutocompleteAddress2Directive from './components/auto-complete/address2/autocomplete-address2.directive';
import CreateButtonComponent from './components/create-budget/create-budget.component.js';
import MdfExportComponent from './components/mdf-export/mdf-export.component';
import AssociatedPersonDirective from './components/associated-person/associated-person.directive';
import AddressEntryDirective from './components/address-entry/address-entry.directive';
import PaginateDirective from './components/paginate/paginate.directive';

angular.module('tinyhandsFrontend', ['angular.chips', ngAnimate, ngCookies, ngCsv, ngFileUpload, ngSanitize, ngTouch, uiBootstrap, 'ui.dateTimeInput', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 
        sharedModule,
        accountModule,
        addressesModule,
        borderStationModule,
        budgetModule,
        collectionIndicatorsModule,
        CIFModule,
        dashboardModule,
        indicatorsModule,
        IRFModule,
        loginModule,
        MonthlyReportModule,
        VDFModule,
        VIFModule,
        photoExportModule,
        countriesModule,
        idmanagementModule,
        personManagementModule,
        traffickermatchModule,
        relatedFormsModule,
        helpModule,
        operationsDashboardModule,
        stationDataModule,
        locationStaffModule,
        locationDataModule,
        auditModule,
        legalCaseModule,
        gospelVerificationModule,
        empModule,
        gspModule,
        pvfModule,
        sfModule,
        lfModule,
        incidentModule,
        staffModule,
        projectRequestModule,
        mdfModule,
        subcommitteeModule,
        formExportModule
    ])

    .constant('constants', constants)

    .config(config)
    .config(httpProviderConfig)
    .config(routerConfig)

    .directive('csvexport', CsvExportDirective)
    .directive('navbar', NavbarDirective)
    .directive('addressEntry', AddressEntryDirective)
    .directive('paginate', PaginateDirective)
    .directive('autocompleteAddress1', AutocompleteAddress1Directive)
    .directive('autocompleteAddress2', AutocompleteAddress2Directive)
    .directive('associatedPerson', AssociatedPersonDirective)
    .component('mdfexport', MdfExportComponent)
    .component('createbudget', CreateButtonComponent);
