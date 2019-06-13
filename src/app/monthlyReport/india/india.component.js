import {BaseMonthlyReportController} from '../baseMonthlyReportController.js';
import './india.less';

import templateUrl from './india.html';

import governanceTemplate from '../common/step-templates/governance.html';
import resourcesTemplate from '../common/step-templates/humanResources.html';
import awarenessTemplate from '../common/step-templates/awareness.html';
import securityTemplate from '../common/step-templates/security.html';
import accountingTemplate from '../common/step-templates/accounting.html';
import victimEngagementTemplate from '../common/step-templates/victimEngagement.html';
import recordsTemplate from '../common/step-templates/records.html';
import aftercareTemplate from '../common/step-templates/aftercare.html';
import paralegalTemplate from '../common/step-templates/paralegal.html';
import investigationsTemplate from '../common/step-templates/investigations.html';
import finalTemplate from '../common/step-templates/final.html';

export class MonthlyReportIndiaController extends BaseMonthlyReportController {
    constructor($scope, constants, MonthlyReportService, $stateParams, $state) {
        'ngInject';        
        super($scope, constants, MonthlyReportService, $stateParams, $state,
                    [
                        "Governance",
                        "Human Resources",
                        "Awareness",
                        "Security",
                        "Accounting",
                        "Victim Engagement",
                        "Records",
                        "Aftercare",
                        "Paralegal",
                        "Investigations"
                    ]
                );
       
        this.stepTemplates = [
            governanceTemplate,
            resourcesTemplate,
            awarenessTemplate,
            securityTemplate,
            accountingTemplate,
            victimEngagementTemplate,
            recordsTemplate,
            aftercareTemplate,
            paralegalTemplate,
            investigationsTemplate,
            finalTemplate
        ];
        
        this.questionFormat = {
            // Governance
            716: {
                enabled:true,
                prompt: "# of subcommittee mettings",
                promptFormat: "col-md-2 control-label",
                options: [
                    {label:"0",format:"col-md-1",points:0},
                    {label:"1",format:"col-md-1",points:20},
                    {label:"2",format:"col-md-1",points:40},
                    {label:">2",format:"col-md-1",points:50},
                ]
            },
            717: {
                enabled:true,
                prompt: "# of times SC visted station",
                promptFormat: "col-md-2 control-label",
                options: [
                    {label:"<10",format:"col-md-1",points:0},
                    {label:"10-20",format:"col-md-1",points:5},
                    {label:"20-30",format:"col-md-1",points:10},
                    {label:">30",format:"col-md-1",points:20},
                ]
            },
            718: {
                enabled:true,
                label:"Records",
                format:"col-md-2",
                points:10
                
            },
            719: {
                enabled:true,
                label:"Security",
                format:"col-md-2",
                points:10
                
            },
            720: {
                enabled:true,
                label:"Aftercare",
                format:"col-md-2",
                points:10
                
            },
            721: {
                enabled:true,
                label:"Paralegal",
                format:"col-md-2",
                points:10
                
            },
            722: {
                enabled:true,
                label:"Station Investigator",
                format:"col-md-2",
                points:10
                
            },
            
            // Human Resources
            731: {
                enabled:true,
                prompt: "Staff hours per week",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"<40",format:"col-md-1",points:10},
                    {label:"40",format:"col-md-2",points:20},
                    {label:"41-50",format:"col-md-2",points:20},
                    {label:">50",format:"col-md-1",points:10},
                ]
            },
            732: {
                enabled:true,
                prompt: "Appointment Letter & Agreement Contract for all staff?",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:30},
                ]
            },
            733: {
                enabled:true,
                prompt: "Information on all staff provided to National Office",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:10},
                ]
            },
            734: {
                enabled:true,
                prompt: "Percent of staff who have taken and passed TMS Exam",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"<30%",format:"col-md-1",points:0},
                    {label:"30-59%",format:"col-md-2",points:5},
                    {label:"60-99%",format:"col-md-2",points:10},
                    {label:"100%",format:"col-md-1",points:25},
                ]
            }, 
            735: {
                enabled:true,
                prompt: "Percent of coordinators who have passed Coordinator Exams",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"<30%",format:"col-md-1",points:0},
                    {label:"30-59%",format:"col-md-2",points:5},
                    {label:"60-99%",format:"col-md-2",points:10},
                    {label:"100%",format:"col-md-1",points:15},
                ]
            }, 
            
            // Awareness
            739: {
                enabled:true,
                prompt: "Staff awareness hours",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<5",format:"col-md-1",points:0},
                    {label:"6-25",format:"col-md-2",points:8},
                    {label:"26-50",format:"col-md-2",points:15},
                    {label:">50",format:"col-md-2",points:25},
                ]
            },
            740: {
                enabled:true,
                prompt: "SC awareness hours",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<10",format:"col-md-1",points:0},
                    {label:"10-20",format:"col-md-2",points:5},
                    {label:"21-30",format:"col-md-2",points:10},
                    {label:">30",format:"col-md-2",points:20},
                ]
            }, 
            741: {
                enabled:true,
                prompt: "Phone calls from materials",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<10",format:"col-md-1",points:0},
                    {label:"10-20",format:"col-md-2",points:5},
                    {label:"21-30",format:"col-md-2",points:8},
                    {label:">30",format:"col-md-2",points:10},
                ]
            }, 
            742: {
                enabled:true,
                prompt: "Contact Cards",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<10",format:"col-md-1",points:0},
                    {label:"10-20",format:"col-md-2",points:5},
                    {label:">20",format:"col-md-2",points:8},
                ]
            }, 
            743: {
                enabled:true,
                prompt: "Brochures/Stickers/Posters",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<20",format:"col-md-1",points:0},
                    {label:"20-35",format:"col-md-2",points:5},
                    {label:"36-50",format:"col-md-2",points:9},
                    {label:">50",format:"col-md-2",points:12},
                ]
            }, 
            744: {
                enabled:true,
                prompt: "Most Recent Awareness Gathering",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"never",format:"col-md-1",points:0},
                    {label:">1 year",format:"col-md-2",points:3},
                    {label:"6-12 months",format:"col-md-2",points:7},
                    {label:"3-6 months",format:"col-md-2",points:10},
                    {label:"<3 months",format:"col-md-2",points:15},
                ]
            },
            745: {
                enabled:true,
                prompt: "Most Recent Transportation Workers Gathering",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"never",format:"col-md-1",points:0},
                    {label:">1 year",format:"col-md-2",points:2},
                    {label:"6-12 months",format:"col-md-2",points:6},
                    {label:"3-6 months",format:"col-md-2",points:8},
                    {label:"<3 months",format:"col-md-2",points:10},
                ]
            },
            
            // Security
            749: {
                enabled:true,
                prompt: "Security Protocol followed when taking victims to safe house",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"never",format:"col-md-1",points:0},
                    {label:"<50% of the time",format:"col-md-2",points:5},
                    {label:">50% of the time",format:"col-md-2",points:15},
                    {label:"always",format:"col-md-2",points:25},
                ]
            },
            750: {
                enabled:true,
                prompt: "Staff vary routes when traveling to the shelter / booth",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"never",format:"col-md-1",points:0},
                    {label:"<50% of the time",format:"col-md-2",points:5},
                    {label:">50% of the time",format:"col-md-2",points:10},
                    {label:"always",format:"col-md-2",points:15},
                ]
            },
            751: {
                enabled:true,
                prompt: "Staff frequently rotate shifts and locations",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:15},
                ]
            },
            752: {
                enabled:true,
                prompt: "Staff vary clothing and appearance, dress to fit-in",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:10},
                ]
            },
            753: {
                enabled:true,
                prompt: 'Were all threats reported? (mark "yes" if no threats)',
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:25},
                ]
            },
            754: {
                enabled:true,
                prompt: "If prior threat, staff have protection devices?",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes/no threats",format:"col-md-2",points:10},
                ]
            },
            
            // Accounting
            758: {
                enabled:true,
                prompt: "Receipt & Voucher for all transactions",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:30},
                ]
            },
            759: {
                enabled:true,
                prompt: "All Transactions Listed in Daybook",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:15},
                ]
            },
            760: {
                enabled:true,
                prompt: "Monthly Payment Record filled out, sent",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:25},
                ]
            },
            761: {
                enabled:true,
                prompt: "Yearly Accounting Submitted to TH India by last March 31st",
                promptFormat: "col-md-4 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:30},
                ]
            },
            
            // Victim Engagement
            765: {
                enabled:true,
                prompt: "Potential Victims questioned this month",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<50",format:"col-md-1",points:20},
                    {label:"51-150",format:"col-md-2",points:55},
                    {label:"151-300",format:"col-md-2",points:75},
                    {label:">300",format:"col-md-2",points:100},
                ]
            },
            
            // Records
            769: {
                enabled:true,
                prompt: "Station Logbooks filled out",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:15},
                ]
            },
            770: {
                enabled:true,
                prompt: "IRF fully filled out and sent to TH for all intercepts",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:30},
                ]
            },
            771: {
                enabled:true,
                prompt: "Photo percentage",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<70%",format:"col-md-1",points:0},
                    {label:"70-89% of the time",format:"col-md-2",points:8},
                    {label:"90-99% of the time",format:"col-md-2",points:10},
                    {label:"100%",format:"col-md-2",points:15},
                ]
            },
            772: {
                enabled:true,
                prompt: "Photo percentage",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<70%",format:"col-md-1",points:10},
                    {label:"70-89% of the time",format:"col-md-2",points:20},
                    {label:"90-99% of the time",format:"col-md-2",points:35},
                    {label:"100%",format:"col-md-2",points:40},
                ]
            },
            
            // Aftercare
            776: {
                enabled:true,
                prompt: "Chori",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:2},
                    {label:"76-99% of the time",format:"col-md-2",points:3},
                    {label:"100%",format:"col-md-2",points:5},
                ]
            },
            777: {
                enabled:true,
                prompt: "TDMGD",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:2},
                    {label:"76-99% of the time",format:"col-md-2",points:3},
                    {label:"100%",format:"col-md-2",points:5},
                ]
            },
            778: {
                enabled:true,
                prompt: "MTV Exit",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:2},
                    {label:"76-99% of the time",format:"col-md-2",points:3},
                    {label:"100%",format:"col-md-2",points:5},
                ]
            },
            779: {
                enabled:true,
                prompt: "Tracts Given",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:3},
                    {label:"76-99% of the time",format:"col-md-2",points:4},
                    {label:"100%",format:"col-md-2",points:10},
                ]
            },
            781: {
                enabled:true,
                prompt: "Messagebook Given",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:3},
                    {label:"76-99% of the time",format:"col-md-2",points:5},
                    {label:"100%",format:"col-md-2",points:15},
                ]
            },
            782: {
                enabled:true,
                prompt: "Redemption Movie",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<25%",format:"col-md-1",points:0},
                    {label:"25-75% of the time",format:"col-md-2",points:2},
                    {label:"76-99% of the time",format:"col-md-2",points:4},
                    {label:"100%",format:"col-md-2",points:15},
                ]
            },
            783: {
                enabled:true,
                prompt: "Interviews recorded w/victim's knowledge",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:10},
                ]
            },
            784: {
                enabled:true,
                prompt: "All interviews in private room, max. 2 women",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:15},
                ]
            },
            785: {
                enabled:true,
                prompt: "Discussion of a victims' case does not take place with anyone except TH India staff, SC members, and police (if necessary)",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:10},
                ]
            },
            786: {
                enabled:true,
                prompt: "NGO in victims’ areas contacted",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:10},
                ]
            },
            
            //Paralegal
            790: {
                enabled:true,
                prompt: "Total FIRs filed",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"0",format:"col-md-1",points:0},
                    {label:"1",format:"col-md-2",points:20},
                    {label:"2",format:"col-md-2",points:30},
                    {label:"3 or more",format:"col-md-2",points:40},
                ]
            },
            791: {
                enabled:true,
                prompt: "If filed case, did you scan &amp; send copy of FIR to Regional HQ?",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"no",format:"col-md-1",points:0},
                    {label:"yes",format:"col-md-2",points:20},
                ]
            },
            792: {
                enabled:true,
                // integer input
            },
            793: {
                enabled:true,
                prompt: "CIF % for Clear Evidence Cases",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<60%",format:"col-md-1",points:0},
                    {label:"60-79%",format:"col-md-2",points:15},
                    {label:"80-99%",format:"col-md-2",points:30},
                    {label:"100%",format:"col-md-2",points:40},
                ]
            },
            
            // Investigations
            797: {
                enabled:true,
                prompt: "# of HVCs",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<2",format:"col-md-1",points:0},
                    {label:"3-5",format:"col-md-2",points:15},
                    {label:">5",format:"col-md-2",points:35},
                ]
            },
            798: {
                enabled:true,
                prompt: "INT from HVCs",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"None",format:"col-md-1",points:0},
                    {label:"<15%",format:"col-md-2",points:15},
                    {label:"15-30%",format:"col-md-2",points:25},
                    {label:">30%",format:"col-md-2",points:40},
                ]
            },
            799: {
                enabled:true,
                prompt: "How many times visited hotels?",
                promptFormat: "col-md-3 control-label",
                options: [
                    {label:"<6",format:"col-md-1",points:0},
                    {label:"6-20",format:"col-md-2",points:15},
                    {label:">20",format:"col-md-2",points:25},
                ]
            },
        }
    }
}

export default {
    templateUrl,
    controller: MonthlyReportIndiaController
};