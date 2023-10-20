import * as React from 'react';
import SessionService from "../../shared/services/session.service";
import IrfNewListService from "../../irf/newList/irfNewList.service";
import DatePicker from "react-date-picker";
import _ from 'lodash';

import "react-date-picker/dist/DatePicker.css";
// @ts-ignore
import createIrfModalTemplate from '../../irf/newList/createIrfModal.html';
// @ts-ignore
import attachmentExportModalTemplate from '../../irf/newList/attachmentExportModal.html'
import {DummyAngularComponentWrapped} from "../../components/dummy-component/dummy-component.react.component";
import {PaginateComponentReact} from "../../components/paginate/paginate.react.component";
import PureReactComponent from "../../components/pure-react-component/pure-react-component";
import {PhotoExportReact} from "../../components/photo-export/photo-export.react.component";
import Select from "react-select";

// Steps I used:
// Make a class-based react component
// Copy the AngularJS constructor in as the react component's constructor
// All of the this.xxx = ZZZ that come from angular dependencies get commented out
// All usages of the above angular dependencies change from this.xxx to this.props.ZZZ (except this.state = $state)
//  (simple find and replace on each statement in constructor)
// All of the other this.yyy = [] for initialization of state become stateModifications.yyy = []
//   this.state = stateModifications at the end of the constructor
// Copy over the functions of the class, calls to this.aMethodOfTheClass() does NOT change,
//   but code inside changes in similar ways to the constructor
// All expressions using the above variables become this.state.yyy as well
// Find places where state is changed, make a new stateModifications object copying the existing state
//   then use stateState(stateModifications)
// <div ng-if="expression"></div> becomes {expression && (<div></div)}
// ng-click="expression()" becomes onClick={() => { expression() }
// if ng-model is on the same tag as ng-click, set the state in the onClick function
// Add types
// Change date inputs to react-date-picker
// Add html imports but add @ts-ignore
// ng-class to className
// turned all angular components I needed into react components
// replaced all selects (single and multi selects) with react-select
//   - add react select component at right place (add isMulti flag if needed)
//   - change options objects to use id instead of value
//   -

// TODO:
//  - automatically default status to !invalid
//  - modals open but don't work right
//  - countries list
//  - sticky header
//  - date type connected to dates
//  - dates to show up
//  - Page keeps redirecting me to log in all the time

type ReactIrfListProps = {
    // Props from parent

    // AngularJS Injections
    SessionService: SessionService
    IrfNewListService: IrfNewListService
    $stateParams: any
    $uibModal: any
    StickyHeader: any
    SpinnerOverlayService: any
    $state: any
    $timeout: any
    toastr: any
    constants: any
    moment: any
};

// Should really be typed like so:
// {
// countries: any[],
// stationsForAdd: any[],
// ...
// }

type Irf = {
    irf_number: number
    status: any;
    staff_name: any;
    number_of_victims: number;
    number_of_traffickers: number;
    date_time_of_interception: string;
    verified_date: any;
    date_time_last_updated: string;
    station: any;
    confirmedDelete: any;
}

type ReactIrfListState = {
    countries: any[],
    stationsForAdd: any[],
    timer: any,
    searchTimer: any,
    irfs: any[],
    nextPage: string
    timeZoneDifference: string,
    queryParameters: any,
    paginate: any,
    stickyOptions: any,
    countryDropDown: any,
    date_start: Date | null,
    date_end: Date | null,
    //  false, "true"? Not sure how checkbox input works
    may_be_verified_by_account: boolean | string,
    oldIndex: number,
    status: any
}

type ReactIrfListStateModifications = Partial<ReactIrfListState>


class ReactIrfList extends React.Component<ReactIrfListProps, ReactIrfListStateModifications> {
    // TODO this has to be a typo when someone deleted part of the word change
    ange: any;

    constructor(props: ReactIrfListProps) {
        super(props);

        let stateBeingBuilt: ReactIrfListStateModifications = {}
        stateBeingBuilt.countries = [];
        stateBeingBuilt.stationsForAdd = [];
        stateBeingBuilt.timer = {};
        stateBeingBuilt.searchTimer = null;
        stateBeingBuilt.irfs = [];
        stateBeingBuilt.nextPage = '';
        stateBeingBuilt.timeZoneDifference = '+0545';
        stateBeingBuilt.queryParameters = {
            page_size: 20,
            reverse: true,
            ordering: 'date_of_interception,time_of_interception',
            search: '',
            status: '!invalid',
            country_ids: '',
        };

        stateBeingBuilt.paginate = {
            items: 0,
            pageSize: stateBeingBuilt.queryParameters.page_size,
            currentPage: 1,
        };

        stateBeingBuilt.stickyOptions = this.props.StickyHeader.stickyOptions;
        stateBeingBuilt.stickyOptions.zIndex = 1;

        stateBeingBuilt.countryDropDown = {};
        stateBeingBuilt.countryDropDown.options = [];
        stateBeingBuilt.countryDropDown.selectedOptions = [];

        stateBeingBuilt.countryDropDown.customText = {buttonDefaultText: 'All'};
        stateBeingBuilt.countryDropDown.eventListener = {
            onItemSelect: this.countryChange,
            onItemDeselect: this.countryChange,
            onSelectAll: this.countryChange,
            onDeselectAll: this.countryChange,
            ctrl: this,
        };
        stateBeingBuilt.queryParameters.date_filter = 'None';
        stateBeingBuilt.date_end = new Date();
        stateBeingBuilt.date_start = new Date();
        stateBeingBuilt.date_start.setUTCDate(1);
        stateBeingBuilt.may_be_verified_by_account = false;

        stateBeingBuilt.oldIndex = 3;
        stateBeingBuilt.status = {};
        stateBeingBuilt.status.options = [{value: '!invalid', label: 'all valid', group: 'z'},
            {value: 'in-progress', label: 'in-progress', group: 'Status'},
            {value: 'approved,!None', label: 'submitted', group: 'Status'},
            {value: 'first-verification', label: 'first-verification', group: 'Status'},
            {value: 'second-verification', label: 'second-verification', group: 'Status'},
            {value: 'verification-tie', label: 'verification-tie', group: 'Status'},
            {value: 'verified', label: 'verified', group: 'Status'},
            {
                value: 'second-verification|verified,Evidence',
                label: 'evidence',
                group: 'Final Verification Evidence Category'
            },
            {
                value: 'second-verification|verified,High',
                label: 'high risk',
                group: 'Final Verification Evidence Category'
            },
            {value: 'invalid', label: 'invalid', group: 'Final Verification Evidence Category'}];
        stateBeingBuilt.status.selectedOptions = [stateBeingBuilt.status.options[0]];
        stateBeingBuilt.status.settings = {
            smartButtonMaxItems: 1,
            showCheckAll: false,
            showUncheckAll: false,
            selectionLimit: 1,
            groupByTextProvider(groupValue) {
                if (groupValue === 'z') {
                    return '';
                } else {
                    return groupValue;
                }
            },
            groupBy: 'group',
            closeOnSelect: true,
        };
        stateBeingBuilt.status.customText = {};
        stateBeingBuilt.status.eventListener = {
            onItemSelect: this.statusChange,
            onItemDeselect: this.ange,
            ctrl: this,
        };

        // If there was a search value provided in the url, set it
        let foundStateParams = false;
        if (this.props.$stateParams) {
            if (this.props.$stateParams.search) {
                foundStateParams = true;
                stateBeingBuilt.queryParameters.search = this.props.$stateParams.search;
            }
            if (this.props.$stateParams.country_ids) {
                foundStateParams = true;
                stateBeingBuilt.queryParameters.country_ids = this.props.$stateParams.country_ids;
            }
            if (this.props.$stateParams.status) {
                foundStateParams = true;
                stateBeingBuilt.queryParameters.status = this.props.$stateParams.status;
            }
        }

        if (!foundStateParams) {
            let tmp = sessionStorage.getItem('irfList-search');
            if (tmp !== null) {
                stateBeingBuilt.queryParameters.search = tmp;
            }
            tmp = sessionStorage.getItem('irfList-status');
            if (tmp !== null) {
                stateBeingBuilt.queryParameters.status = tmp;
            }
            tmp = sessionStorage.getItem('irfList-country_ids');
            if (tmp !== null) {
                stateBeingBuilt.queryParameters.country_ids = tmp;
            }
        }

        let tmp = sessionStorage.getItem('irfList-date_filter');
        if (tmp !== null) {
            stateBeingBuilt.queryParameters.date_filter = tmp;
        }
        tmp = sessionStorage.getItem('irfList-date_start');
        if (tmp !== null) {
            stateBeingBuilt.date_start = new Date(tmp);
        }
        tmp = sessionStorage.getItem('irfList-date_end');
        if (tmp !== null) {
            stateBeingBuilt.date_end = new Date(tmp);
        }

        sessionStorage.setItem('irfList-date_filter', stateBeingBuilt.queryParameters.date_filter);
        // @ts-ignore
        sessionStorage.setItem('irfList-date_start', stateBeingBuilt.date_start);
        // @ts-ignore
        sessionStorage.setItem('irfList-date_end', stateBeingBuilt.date_end);

        if (stateBeingBuilt.queryParameters.status !== '') {
            stateBeingBuilt.status.selectedOptions = [];
            for (let optionIdx in stateBeingBuilt.status.options) {
                if (stateBeingBuilt.queryParameters.status === stateBeingBuilt.status.options[optionIdx].id) {
                    stateBeingBuilt.status.selectedOptions.push(stateBeingBuilt.status.options[optionIdx]);
                    break;
                }
            }
        }

        // This is the only time that state can be set outside of setState
        //  during construction
        this.state = stateBeingBuilt;

        this.getUserCountries();
        this.searchIrfs();

        this.getUserStationsForAdd([]).then((stationsForAdd) => {
            const stateModifications: ReactIrfListStateModifications = {}
            stateModifications.stationsForAdd = stationsForAdd;
            this.setState(stateModifications)
        });
    }

    // Not sure if these are supposed to be in the constructor or not
    componentDidMount() {
    }


    setSearchTimer() {
        if (this.state.searchTimer) {
            this.props.$timeout.cancel(this.state.searchTimer);
        }

        this.setState(
            {
                searchTimer: this.props.$timeout(() => {
                    this.searchTimerExpired();
                }, 1500)
            }
        )
    }

    searchTimerExpired() {
        let stateModifications: ReactIrfListStateModifications = {};
        stateModifications.searchTimer = null;

        var selectedCountries = '';
        var sep = '';
        for (var idx = 0; idx < this.state.countryDropDown.selectedOptions.length; idx++) {
            selectedCountries = selectedCountries + sep + this.state.countryDropDown.selectedOptions[idx].value;
            sep = ',';
        }

        var selectedStatus = '';
        if (this.state.status.selectedOptions.length > 0) {
            selectedStatus = this.state.status.selectedOptions[0].id;
        }

        if (this.state.status.selectedOptions.length > 0 &&
            this.state.status.selectedOptions[0].label !== 'submitted' && this.state.status.selectedOptions[0].label !== 'verification-tie') {
            stateModifications.may_be_verified_by_account = false;
        }

        if (this.state.queryParameters.country_ids !== selectedCountries || this.state.queryParameters.status !== selectedStatus ||
            this.state.queryParameters.may_verify !== stateModifications.may_be_verified_by_account) {
            stateModifications.queryParameters = this.state.queryParameters;
            stateModifications.queryParameters.country_ids = selectedCountries;
            stateModifications.queryParameters.status = selectedStatus;
            stateModifications.queryParameters.may_verify = stateModifications.may_be_verified_by_account;
            this.setState(stateModifications);
            this.searchIrfs();
        } else {
            this.setState(stateModifications);
        }
    }

    countryChange() {
        // TODO does this work without this.ctrl?
        this.setSearchTimer();
    }

    statusChange() {
        // TODO does this work without this.ctrl?
        if (this.state.status.selectedOptions > 0 &&
            this.state.status.selectedOptions[0].label !== 'submitted' && this.state.status.selectedOptions[0].label !== 'verification-tie') {
            this.setState({
                may_be_verified_by_account: false
            });
        }
        this.searchTimerExpired();
    }

    hasAddPermission() {
        return this.props.SessionService.checkPermission('IRF', 'ADD', null, null) === true;
    }

    getUserCountries() {
        console.log('getUserCountries');
        let keepOldList = ['Nepal', 'Bangladesh', 'India'];
        let keepOld = false;
        this.props.IrfNewListService.getUserCountries(this.props.SessionService.user.id).then(promise => {
            console.log('country promise returned', promise.data);
            let stateModifications: ReactIrfListStateModifications = {};
            stateModifications.countries = promise.data;
            stateModifications.countryDropDown = this.state.countryDropDown;
            stateModifications.countryDropDown.options = [];
            for (var idx = 0; idx < stateModifications.countries.length; idx++) {
                stateModifications.countryDropDown.options.push({
                    value: stateModifications.countries[idx].id,
                    label: stateModifications.countries[idx].name,
                });
                if (keepOldList.indexOf(stateModifications.countries[idx].name) > -1) {
                    keepOld = true;
                }
            }
            this.getUserStationsForAdd(promise.data).then((stationsForAdd) => {
                // Use existing state modifications
                stateModifications.stationsForAdd = stationsForAdd;

                if (this.state.queryParameters.country_ids.length > 0) {
                    let country_array = this.state.queryParameters.country_ids.split(',');
                    for (let idx = 0; idx < country_array.length; idx++) {
                        let country_id = Number(country_array[idx]);
                        stateModifications.countries = this.state.countries;
                        stateModifications.countryDropDown = this.state.countryDropDown;
                        for (let idx1 = 0; idx1 < stateModifications.countries.length; idx1++) {
                            if (stateModifications.countries[idx1].id === country_id) {
                                stateModifications.countryDropDown.selectedOptions.push(stateModifications.countryDropDown.options[idx1]);
                            }
                        }
                    }
                }

                if (!keepOld && stateModifications.status.options[stateModifications.oldIndex].label.startsWith('old')) {
                    stateModifications.status = this.state.status;
                    stateModifications.status.options.splice(stateModifications.oldIndex, 1);
                }
                this.setState(stateModifications);
            });
        });
    }

    searchIrfs() {
        if (this.state.timer.hasOwnProperty('$$timeoutId')) {
            this.props.$timeout.cancel(this.state.timer);
        }

        sessionStorage.setItem('irfList-search', this.state.queryParameters.search);
        sessionStorage.setItem('irfList-status', this.state.queryParameters.status);
        sessionStorage.setItem('irfList-country_ids', this.state.queryParameters.country_ids);
        sessionStorage.setItem('irfList-date_filter', this.state.queryParameters.date_filter);
        // @ts-ignore
        sessionStorage.setItem('irfList-date_start', this.state.date_start);
        // @ts-ignore
        sessionStorage.setItem('irfList-date_end', this.state.date_end);

        let stateModifications: ReactIrfListStateModifications = {}
        stateModifications.queryParameters = this.state.queryParameters;
        stateModifications.queryParameters.date_start = this.dateAsString(this.state.date_start);
        stateModifications.queryParameters.date_end = this.dateAsString(this.state.date_end);
        stateModifications.timer = this.props.$timeout(() => {
            this.props.$state.go('.', {
                search: this.state.queryParameters.search,
                status: this.state.queryParameters.status,
                country_ids: this.state.queryParameters.country_ids,
            });
            this.getIrfList();
        }, 500);
        this.setState(stateModifications);
    }

    getUserStationsForAdd(countries) {
        console.log('Calling backend for user stations state')
        return this.props.IrfNewListService.getUserStationsForAdd(this.props.SessionService.user.id).then(promise => {
            const stationsForAdd = promise.data;
            for (let idx = 0; idx < stationsForAdd.length; idx++) {
                for (let idx2 = 0; idx2 < countries.length; idx2++) {
                    if (stationsForAdd[idx].operating_country === countries[idx2].id) {
                        stationsForAdd[idx].country_name = countries[idx2].name;
                        stationsForAdd[idx].country_id = countries[idx2].id;
                    }
                }
            }
            return stationsForAdd;
        });
    }

    dateAsString(inDate) {
        let dateString = '';
        dateString = inDate.getUTCFullYear() + '-';
        if (inDate.getUTCMonth() < 9) {
            dateString += '0';
        }
        dateString += (inDate.getUTCMonth() + 1) + "-";
        if (inDate.getUTCDate() <= 9) {
            dateString += '0';
        }
        dateString += inDate.getUTCDate();
        return dateString;
    }

    getIrfList() {
        this.showPage(1);
    }

    showPage(pageNumber) {
        this.props.SpinnerOverlayService.show("Searching for IRFs...");
        this.props.IrfNewListService.getIrfList(this.transform(this.state.queryParameters, pageNumber)).then((promise) => {
            let stateModifications: ReactIrfListStateModifications = {}
            stateModifications.irfs = promise.data.results;
            stateModifications.paginate = this.state.paginate;
            stateModifications.paginate.items = promise.data.count;
            stateModifications.paginate.currentPage = pageNumber;
            this.setState(stateModifications)
            this.props.SpinnerOverlayService.hide();
            this.addUrls(stateModifications.irfs);
        });
    }

    transform(queryParameters, pageNumber) {
        var queryParams = _.cloneDeep(queryParameters);
        if (queryParams.reverse) {
            let parts = queryParams.ordering.split(',');
            queryParams.ordering = "";
            for (let idx = 0; idx < parts.length; idx++) {
                if (queryParams.ordering.length > 0) {
                    queryParams.ordering += ',';
                }
                queryParams.ordering += '-' + parts[idx];
            }
        }
        queryParams.page = pageNumber;
        delete queryParams.reverse;
        var params = [];
        Object.keys(queryParams).forEach(name => {
            if (queryParams[name] !== null && queryParams[name] !== '') {
                params.push({name: name, value: queryParams[name]});
            }
        });
        return params;
    }

    addUrls(irfs) {
        for (let idx = 0; idx < irfs.length; idx++) {
            let irf = irfs[idx];
            if (irf.form_name !== null) {
                irf.viewUrl = this.props.$state.href(irfs[idx].form_name, {
                    id: irf.id,
                    stationId: irf.station.id,
                    countryId: irf.station.operating_country.id,
                    isViewing: true,
                    formName: irfs[idx].form_name,
                });
                irf.editUrl = this.props.$state.href(irfs[idx].form_name, {
                    id: irf.id,
                    stationId: irf.station.id,
                    countryId: irf.station.operating_country.id,
                    isViewing: false,
                    formName: irfs[idx].form_name,
                });
            }
            irf.relatedUrl = this.props.$state.href('relatedForms', {
                stationId: irf.station.id,
                formNumber: irf.irf_number
            });
        }
    }

    createIrf() {
        var stationsForAdd = this.state.stationsForAdd;
        let modalInstance = this.props.$uibModal.open({
            animation: true,
            templateUrl: createIrfModalTemplate,
            controller: 'CreateIrfModalController as vm',
            size: 'md',
            resolve: {
                stations() {
                    return stationsForAdd;
                },
            },
        });
        modalInstance.result.then(station => {
            this.props.IrfNewListService.getFormForStation(station.id).then(response => {
                if (response.data.length > 0) {
                    this.props.$state.go(response.data[0].form_name, {
                        stationId: station.id,
                        countryId: station.country_id,
                        isViewing: false,
                        formName: response.data[0].form_name,
                    });
                } else {
                    this.props.toastr.error('Unable to find form for station ' + station.label);
                }
            });
        });
    }

    deleteIrf(irf, index) {
        if (irf.confirmedDelete) {
            this.props.IrfNewListService.deleteIrf(irf.station.id, irf.id).then(
                () => {
                    // TODO will this work?
                    const newState = _.cloneDeep(this.state)
                    newState.irfs.splice(index, 1);
                    this.setState(newState);
                    this.props.toastr.success('Successfully Deleted IRF!');
                },
                () => {
                    this.props.toastr.error('Unable to Delete IRF!');
                }
            );
        } else {
            irf.confirmedDelete = true;
        }
    }

    attachmentExport() {
        this.props.$uibModal.open({
            animation: true,
            templateUrl: attachmentExportModalTemplate,
            controller: 'AttachmentExportModalController as vm',
            size: 'lg'
        });
    }

    getSortIcon(column, reverse): boolean {
        if (reverse === 'reverse') {
            return column === this.state.queryParameters.ordering && this.state.queryParameters.reverse;
        }
        return column === this.state.queryParameters.ordering && !this.state.queryParameters.reverse;
    }

    updateSort(column: string) {
        let currentState = this.state;

        if (column === this.state.queryParameters.ordering) {
            currentState.queryParameters.reverse = !currentState.queryParameters.reverse;
        }
        currentState.queryParameters.ordering = column;
        this.setState(currentState);
        this.getIrfList();
    }


    // Being lazy, because I don't know if we want to move to AG Grid
    // Usually I would extract this into a separate React component instead of just a function
    createHeaderSortableHeaderCell(column: string, label: string, width: string, hiddenXs?: boolean) {
        // TODO move this code into getSortIcon?
        const isSortedForward = this.getSortIcon(column, '!reverse')
        const isSortedReversed = this.getSortIcon(column, 'reverse')
        let iconClass = ''
        if (isSortedReversed) {
            iconClass = 'glyphicon glyphicon-sort-by-alphabet-alt'
        } else if (isSortedForward) {
            iconClass = 'glyphicon glyphicon-sort-by-alphabet'
        }
        if (hiddenXs) {
            iconClass += ' hidden-xs'
        }
        return (<th onClick={() => {
            this.updateSort(column)
        }} style={{width: width}}>
            {label}
            <i className={iconClass}/>
        </th>)
    }

    // TODO actually do this
    formatDate(date: string) {
        // | date:"medium" : irfNewListCtrl.timeZoneDifference
        return date
    }

    // TODO actually do this
    formatNumber(number: number) {
        //  | number
        return number
    }

    render() {
        console.log('rerendering', this.state?.paginate?.items, this.state.countryDropDown.items);
        // let countryMultiSelect = <div ng-dropdown-multiselect="" options="irfNewListCtrl.countryDropDown.options"
        //                               selected-model="irfNewListCtrl.countryDropDown.selectedOptions"
        //                               extra-settings="irfNewListCtrl.countryDropDown.settings"
        //                               translation-texts="irfNewListCtrl.countryDropDown.customText"
        //                               events="irfNewListCtrl.countryDropDown.eventListener">
        // </div>;
        // let dateTypeSelect = <select ng-model="irfNewListCtrl.queryParameters.date_filter" className="form-control"
        //                              ng-change="irfNewListCtrl.searchIrfs()">
        //     <option value="None">None</option>
        //     <option value="First Verification">First Verification</option>
        //     <option value="Second Verification">Second Verification/Verified</option>
        //     <option value="Interception">Interception</option>
        // </select>;

        // TODO not sure how to do UTC timezone yet
        //  It will also be styled differently
        let fromDateInput = <DatePicker onChange={(newDate: Date | null) => {
            this.setState({
                date_start: newDate
            });
            this.searchIrfs();
        }}/>
        let toDateInput = <DatePicker onChange={(newDate: Date | null) => {
            this.setState({
                date_end: newDate
            });
            this.searchIrfs();
        }}/>
        let searchStringInput = <input placeholder="Search"
                                       className="form-control"
                                       autoFocus
                                       onChange={(event) => {
                                           const newValue = event.target.value
                                           const currentQueryParams = this.state.queryParameters
                                           currentQueryParams.search = newValue
                                           this.setState({
                                               queryParameters: currentQueryParams
                                           });
                                           this.searchIrfs()
                                       }}/>;
        // let statusOptionsMultiSelect = <div style="width:180px" ng-dropdown-multiselect=""
        //                                     options="irfNewListCtrl.status.options"
        //                                     ng-show="irfNewListCtrl.filterType!='Filter by Second-Verification Evidence'"
        //                                     options="irfNewListCtrl.status.options"
        //                                     ng-show="irfNewListCtrl.filterType=='Filter by IRF status'"
        //                                     selected-model="irfNewListCtrl.status.selectedOptions"
        //                                     extra-settings="irfNewListCtrl.status.settings"
        //                                     translation-texts="irfNewListCtrl.status.customText"
        //                                     events="irfNewListCtrl.status.eventListener" className="pull-right">
        // </div>;

        // TODO actually order them
        //  orderBy:this.queryParameters.ordering:this.queryParameters.reverse
        let orderedIrfs = this.state.irfs;

        // TODO re-add this part
        //   float-thead="irfNewListCtrl.stickyOptions"
        //   <thead className="sticky-table-header">
        let table = <table className="table table-striped"
                           ng-model="irfNewListCtrl.irfs">
            <thead>
            <tr>
                <th style={{width: "8%"}}>Status</th>
                {this.createHeaderSortableHeaderCell('irf_number', 'IRF #', '8%')}
                {this.createHeaderSortableHeaderCell('staff_name', 'Staff Name', '15%')}
                {this.createHeaderSortableHeaderCell('number_of_victims', '# of Potential Victims', '10%')}
                {this.createHeaderSortableHeaderCell('number_of_traffickers', '# of Suspects', '10%')}
                {this.createHeaderSortableHeaderCell('date_of_interception,time_of_interception', 'Time of Interception', '16%')}
                {this.createHeaderSortableHeaderCell('verified_date', 'Verification Date', '16%', true)}
                {this.createHeaderSortableHeaderCell('date_time_last_updated', 'Time Last Edited', '16%', true)}
                <th/>
                <th/>
                <th/>
            </tr>
            </thead>
            <tbody>
            {orderedIrfs && orderedIrfs.length > 0 &&
            orderedIrfs.map((irf: Irf, index: number) =>
                <tr key={irf.irf_number}>
                    <td>{irf.irf_number}</td>
                    <td>{irf.status}</td>
                    <td>{irf.staff_name}</td>
                    <td>{this.formatNumber(irf.number_of_victims)}</td>
                    <td>{this.formatNumber(irf.number_of_traffickers)}</td>
                    <td>{this.formatDate(irf.date_time_of_interception)}</td>
                    <td className="hidden-xs">{irf.verified_date}</td>
                    <td className="hidden-xs">{this.formatDate(irf.date_time_last_updated)}</td>
                    {this.props.SessionService.checkPermission('IRF', 'VIEW', irf.station.operating_country.id, irf.station.id) && (
                        // TODO Fix ng-href
                        <td><a className="btn btn-sm btn-primary" ng-href="{{irf.viewUrl}}">View</a></td>
                    )}
                    {this.props.SessionService.checkPermission('IRF', 'EDIT', irf.station.operating_country.id, irf.station.id) && (
                        // TODO Fix ng-href
                        <td><a className="btn btn-sm btn-primary" ng-href="{{irf.editUrl}}">Edit</a></td>
                    )}
                    {this.props.SessionService.checkPermission('IRF', 'DELETE', irf.station.operating_country.id, irf.station.id)
                    && irf.status !== 'second-verification' && irf.status !== 'old' && irf.status !== 'verified'
                    && (
                        <td><a className="btn btn-sm btn-danger" onClick={() => this.deleteIrf(irf, index)}>
                            {irf.confirmedDelete ? "Confirm?" : "Delete"}</a></td>
                    )}
                </tr>
            )}
            {orderedIrfs && orderedIrfs.length == 0 && (
                <tr>
                    <td colSpan={12} style={{textAlign: "center"}}>
                        <h2>No IRFs Matched your search for: "{
                            this.state.queryParameters.search
                        }"</h2>
                    </td>
                </tr>
            )}
            </tbody>
        </table>;
        let paginate = <PaginateComponentReact
            pageControl={this.state.paginate}
            showPage={(pageNumber) => this.showPage(pageNumber)}
        />;
        let mayBeVerifiedCheckbox = <input type="checkbox" className="form-control"
                                           onChange={(event) => {
                                               const newValue = event.target.value
                                               this.setState({
                                                   may_be_verified_by_account: newValue
                                               });
                                               this.searchTimerExpired()
                                           }}/>;
        return (
            <div className="container" id="irfNewList"><br/>
                <div className="row">
                    <div className="col-xs-7">
                        <h1>React!! Interception Record Forms (IRFs)</h1>
                    </div>

                    <div className="pull-right"><br/>
                        {this.props.SessionService.checkPermission('IRF', 'VIEW PI', null, null) && (
                            // <> and </> get removed when building so you don't have a wrapper div
                            <>
                                <button className="btn btn-primary" onClick={() => this.attachmentExport()}>
                                    Export Attachments
                                </button>

                            </>
                        )}
                        {this.props.SessionService.checkPermission('IRF', 'VIEW PI', null, null) && (
                            <PhotoExportReact/>
                        )}
                        {this.hasAddPermission() && (
                            <a className="btn btn-success" onClick={() => this.createIrf()}>Input A New IRF</a>
                        )}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3">
                        <p>Countries</p>
                        <Select value={this.state.countryDropDown.selectedOptions}
                                options={this.state.countryDropDown.options}
                                isMulti={true}
                                onChange={(selectedOptions) => {
                                    const stateModifications: ReactIrfListStateModifications = {}
                                    stateModifications.countryDropDown = this.state.countryDropDown;
                                    stateModifications.countryDropDown.selectedOptions = selectedOptions;
                                    this.setState(stateModifications);
                                    this.countryChange();
                                }}/>
                    </div>
                    {/* End dropdown */}
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-4">Filter by Date</div>
                            <div className="col-md-4">
                                {/*{dateTypeSelect}*/}
                            </div>
                        </div>
                        {this.state.queryParameters.date_filter != 'None' && (
                            <div className="row center-vertical">
                                <div className="col-md-1 center-vertical">
                                    <p>From:</p>
                                </div>
                                <div className="col-md-4">
                                    {fromDateInput}
                                </div>
                                <div className="col-md-1 center-vertical">
                                    <p>To:</p>
                                </div>
                                <div className="col-md-4">
                                    {toDateInput}
                                </div>
                            </div>)}
                    </div>

                    {/* Search */}
                    <div className="col-md-3 search-bar pull-right">
                        <form>
                            <label className="pull-right">
                                {searchStringInput}
                            </label>
                        </form>

                        {/*{statusOptionsMultiSelect}*/}

                    </div>
                    {/* End search */}

                </div>
                {this.state.status.selectedOptions.length > 0 &&
                (this.state.status.selectedOptions[0].label === 'submitted'
                    || this.state.status.selectedOptions[0].label === 'verification-tie') && (
                    <div className="row">
                        <div className="col-md-3 search-bar pull-right">
                            <div className="row center-vertical">
                                <div className="col-md-2">
                                    {mayBeVerifiedCheckbox}
                                </div>
                                <div className="col-md-10">May be verified by me</div>
                            </div>
                        </div>
                    </div>
                )}
                <br/>
                {table}
                <DummyAngularComponentWrapped
                    thingThing={"2"}
                    callback={() => alert('alert from callback in AngularJS')}
                />
                <PureReactComponent callback={() => alert('alert from Pure React')} dataThing={3}/>

                <div className="row text-center">
                    {paginate}
                </div>
                <br/>
            </div>

        );
    }
}

export default ReactIrfList;