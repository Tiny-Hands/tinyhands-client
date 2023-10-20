// import * as React from 'react';
// import SessionService from '../../shared/services/session.service'
//
// type ReactIrfListPureReactComponentProps = {
//     // Props from parent
//
//     // AngularJS Injections
//     SessionService: SessionService
// };
// export const ReactIrfListPureReactComponent = (props: ReactIrfListPureReactComponentProps) => {
//     return (
//         <div className="container" id="irfNewList"><br/>
//
//             <div className="row">
//                 <div className="col-xs-7">
//                     <h1>Interception Record Forms (IRFs)</h1>
//                 </div>
//
//                 <div className="pull-right"><br>
//                     {props.SessionService.checkPermission('IRF', 'VIEW PI', null, null) && (
//                         // <> and </> get removed when building so you don't have a wrapper div
//                         <>
//                             <button className="btn btn-primary" onClick={this.attachmentExport()}>
//                                 Export Attachments
//                             </button>
//
//                         </>
//                     )}
//                     {/*<photoexport*/}
//                     {/*    ng-if="irfNewListCtrl.session.checkPermission('IRF','VIEW PI',null, null)"></photoexport>*/}
//                     {hasAddPermission && (
//                         <a className="btn btn-success" onClick={this.createIrf()}>Input A New IRF</a>
//                     )}
//                 </div>
//             </div>
//
//             <div className="row">
//                 <div className="col-md-3">
//                     <p>Countries</p>
//                     <div ng-dropdown-multiselect="" options="irfNewListCtrl.countryDropDown.options"
//                          selected-model="irfNewListCtrl.countryDropDown.selectedOptions"
//                          extra-settings="irfNewListCtrl.countryDropDown.settings"
//                          translation-texts="irfNewListCtrl.countryDropDown.customText"
//                          events="irfNewListCtrl.countryDropDown.eventListener">
//                     </div>
//                 </div>
//                 <!-- End dropdown -->
//                 <div className="col-md-6">
//                     <div className="row">
//                         <div className="col-md-4">Filter by Date</div>
//                         <div className="col-md-4">
//                             <select ng-model="irfNewListCtrl.queryParameters.date_filter" className="form-control"
//                                     ng-change="irfNewListCtrl.searchIrfs()">
//                                 <option value="None">None</option>
//                                 <option value="First Verification">First Verification</option>
//                                 <option value="Second Verification">Second Verification/Verified</option>
//                                 <option value="Interception">Interception</option>
//                             </select>
//                         </div>
//                     </div>
//                     <div className="row center-vertical" ng-show="irfNewListCtrl.queryParameters.date_filter!='None'">
//                         <div className="col-md-1 center-vertical">
//                             <p>From:</p>
//                         </div>
//                         <div className="col-md-4">
//                             <input type="date" className="form-control" ng-model-options="{timezone: 'utc'}"
//                                    ng-model="irfNewListCtrl.date_start" ng-change="irfNewListCtrl.searchIrfs()">
//                         </div>
//                         <div className="col-md-1 center-vertical">
//                             <p>To:</p>
//                         </div>
//                         <div className="col-md-4">
//                             <input type="date" className="form-control" ng-model-options="{timezone: 'utc'}"
//                                    ng-model="irfNewListCtrl.date_end" ng-change="irfNewListCtrl.searchIrfs()">
//                         </div>
//                     </div>
//                 </div>
//
//                 <!-- Search -->
//                 <div className="col-md-3 search-bar pull-right">
//                     <form>
//                         <label className="pull-right">
//                             <input ng-change="irfNewListCtrl.searchIrfs()"
//                                    ng-model="irfNewListCtrl.queryParameters.search" placeholder="Search"
//                                    className="form-control" autoFocus>
//                         </label>
//                     </form>
//
//                     <div style="width:180px" ng-dropdown-multiselect="" options="irfNewListCtrl.status.options"
//                          ng-show="irfNewListCtrl.filterType!='Filter by Second-Verification Evidence'"
//                          options="irfNewListCtrl.status.options"
//                          ng-show="irfNewListCtrl.filterType=='Filter by IRF status'"
//                          selected-model="irfNewListCtrl.status.selectedOptions"
//                          extra-settings="irfNewListCtrl.status.settings"
//                          translation-texts="irfNewListCtrl.status.customText"
//                          events="irfNewListCtrl.status.eventListener" className="pull-right">
//                     </div>
//
//                 </div>
//                 <!-- End search -->
//
//             </div>
//             <div className="row"
//                  ng-if="irfNewListCtrl.status.selectedOptions[0].label === 'submitted' || irfNewListCtrl.status.selectedOptions[0].label==='verification-tie'">
//                 <div className="col-md-3 search-bar pull-right">
//                     <div className="row center-vertical">
//                         <div className="col-md-2">
//                             <input type="checkbox" className="form-control"
//                                    ng-model="irfNewListCtrl.may_be_verified_by_account"
//                                    ng-change="irfNewListCtrl.searchTimerExpired()"/>
//                         </div>
//                         <div className="col-md-10">May be verified by me</div>
//                     </div>
//                 </div>
//             </div>
//             <br/>
//             <table className="table table-striped" float-thead="irfNewListCtrl.stickyOptions"
//                    ng-model="irfNewListCtrl.irfs">
//                 <thead className="sticky-table-header">
//                 <tr>
//                     <th ng-click="irfNewListCtrl.updateSort('irf_number')" width="8%">IRF #
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('irf_number', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('irf_number', 'reverse') }"></i>
//                     </th>
//                     <th width="8%">Status</th>
//                     <th ng-click="irfNewListCtrl.updateSort('staff_name')" width="15%">Staff Name
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('staff_name', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('staff_name', 'reverse')}"></i>
//                     </th>
//                     <th ng-click="irfNewListCtrl.updateSort('number_of_victims')" width="10%"># of Potential Victims
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('number_of_victims', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('number_of_victims', 'reverse')}"></i>
//                     </th>
//                     <th ng-click="irfNewListCtrl.updateSort('number_of_traffickers')" width="10%"># of Suspects
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('number_of_traffickers', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('number_of_traffickers', 'reverse')}"></i>
//                     </th>
//                     <th ng-click="irfNewListCtrl.updateSort('date_of_interception,time_of_interception')"
//                         width="16%">Time of Interception
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('date_of_interception,time_of_interception', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('date_of_interception,time_of_interception', 'reverse')}"></i>
//                     </th>
//                     <th ng-click="irfNewListCtrl.updateSort('verified_date')" width="16%"
//                         className="hidden-xs">Verification Date
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('verified_date', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('verified_date', 'reverse')}"></i>
//                     </th>
//                     <th ng-click="irfNewListCtrl.updateSort('date_time_last_updated')" width="16%"
//                         className="hidden-xs">Time Last Edited
//                         <i ng-class="{ 'glyphicon glyphicon-sort-by-alphabet': irfNewListCtrl.getSortIcon('date_time_last_updated', '!reverse'),
//                     'glyphicon glyphicon-sort-by-alphabet-alt': irfNewListCtrl.getSortIcon('date_time_last_updated', 'reverse')}"></i>
//                     </th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 <tr ng-repeat="irf in irfNewListCtrl.irfs | orderBy:this.queryParameters.ordering:this.queryParameters.reverse">
//                     <td>{{irf.irf_number}}</td>
//                     <td>{{irf.status}}</td>
//                     <td>{{irf.staff_name}}</td>
//                     <td>{{irf.number_of_victims | number}}</td>
//                     <td>{{irf.number_of_traffickers | number}}</td>
//                     <td>{{irf.date_time_of_interception | date:"medium" : irfNewListCtrl.timeZoneDifference}}</td>
//                     <td className="hidden-xs">{{irf.verified_date}}</td>
//                     <td className="hidden-xs">{{
//                         irf
//                         .date_time_last_updated | date:"medium" : irfNewListCtrl.timeZoneDifference}}</td>
//                     <td ng-if="irfNewListCtrl.session.checkPermission('IRF','VIEW',irf.station.operating_country.id, irf.station.id)">
//                         <a className="btn btn-sm btn-primary" ng-href="{{irf.viewUrl}}">View</a></td>
//                     <td ng-if="irfNewListCtrl.session.checkPermission('IRF','EDIT',irf.station.operating_country.id, irf.station.id)">
//                         <a className="btn btn-sm btn-primary" ng-href="{{irf.editUrl}}">Edit</a></td>
//                     <td ng-if="irfNewListCtrl.session.checkPermission('IRF','DELETE',irf.station.operating_country.id, irf.station.id) && irf.status !== 'second-verification' && irf.status !== 'old' && irf.status !== 'verified'">
//                         <a className="btn btn-sm btn-danger" ng-click="irfNewListCtrl.deleteIrf(irf, $index)">
//                             {{irf.confirmedDelete ? "Confirm?" : "Delete"}}</a></td>
//                 </tr>
//                 <tr ng-show="irfNewListCtrl.irfs.length == 0">
//                     <td colSpan="12" style="text-align:center;"><h2>No IRFs Matched your search for: "{{
//                         irfNewListCtrl
//                         .queryParameters.search
//                     }}"</h2></td>
//                 </tr>
//                 </tbody>
//             </table>
//
//             <div className="row text-center">
//                 <paginate page-control="irfNewListCtrl.paginate" controller="irfNewListCtrl">
//             </div>
//             <br>
//         </div>
//
// );
// };
//
// export default ReactIrfListPureReactComponent;
// export type
//     {
//         ReactIrfListPureReactComponentProps
//     }