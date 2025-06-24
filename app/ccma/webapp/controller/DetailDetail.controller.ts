import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Button, {} from "sap/m/Button"
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
export type TDetailDetailRouteParameters = {
    id:string;
    productPackId:string;
    contractId: string;
    layout:string;
}

/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Detail extends BaseController {
    private id: string;
    private productPackID: string;
    private contractId: string;

    public onInit() {
        this.getRouter().getRoute("detail-detail")?.attachPatternMatched(this.onMatched, this);

        const oModel: JSONModel = new JSONModel({
            busy: false,
            delay: 0,
            editMode: false,
            ContractInformationForm: {
                busy: false,
                delay: 0,
                editMode: false,
            },
            minDate: new Date(),
        });

        const messagesModel = new JSONModel({
            contractInformationDetailDetail: []
        });
                
        this.setModel(messagesModel, "messages");
        this.setModel(oModel, "ui");

    }

    public onMatched(event: Route$PatternMatchedEvent): void {
        const args = event.getParameter("arguments") as TDetailDetailRouteParameters;
        this.id = args.id;
        this.productPackID = args.productPackId;
        this.contractId = args.contractId;
        (this.getModel('appView') as JSONModel).setProperty("/layout", args.layout);
        this.bindContractInformationForm();
    }


    /**
     * Set the full screen mode to false and navigate to master page
     */
    private onCloseDetailPress() {
        (this.getModel('appView') as JSONModel).setProperty("/actionButtonsInfo/endColumn/fullScreen", false);
        (this.getModel('appView') as JSONModel).setProperty("/layout", "TwoColumnsMidExpanded")
        this.getRouter().navTo("detail", { layout: "TwoColumnsMidExpanded", id: this.id });
    }

    /**
     * Toggle between full and non full screen mode.
     */
    private toggleFullScreen() {
        const isFullScreen = this.getModel("appView")?.getProperty("/actionButtonsInfo/endColumn/fullScreen");
        (this.getModel('appView') as JSONModel).setProperty("/actionButtonsInfo/endColumn/fullScreen", !isFullScreen);
        if (!isFullScreen) {
            // store current layout and go full screen
            (this.getModel('appView') as JSONModel).setProperty("/previousLayout", this.getModel("appView")?.getProperty("/layout"));
            (this.getModel('appView') as JSONModel).setProperty("/layout", "EndColumnFullScreen");
        } else {
            // reset to previous layout
            (this.getModel('appView') as JSONModel).setProperty("/layout", this.getModel("appView")?.getProperty("/previousLayout"));
        }
    }

    private bindContractInformationForm() {
        const form = this.byId("idDetailDetailContractInformation");
        // const oContextBinding = this.getView()?.getModel()?.bindContext(`/CCMContractDetailView('${this.contractId}')`); 
        const path = `/CCMContractDetailView('${this.contractId}')`; 
        // this.getView()?.setBindingContext(oContextBinding?.getBoundContext())
        form?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "ContractInformation"
            }
        });
    }

    public onContractInformationFormEditBtnPress () {
        this.getUIModel()?.setProperty("/ContractInformationForm/editMode", true);
    }

    public onContractInformationFormCancelBtnPress () {
        (this.getModel() as ODataModel)?.resetChanges("ContractInformation");
        this.getUIModel()?.setProperty("/ContractInformationForm/editMode", false);
        this.removeMessageFromMessageManager("contractInformationDetailDetail");
    }

    /**
     * The promise returned by submitBatch can be used together with the hasPendingChanges method to check whether changes were successfully persisted. 
     * hasPendingChanges exists for the ODataModel as well as for ODataListBinding, ODataContextBinding and ODataPropertyBinding. 
     * Note that the promise returned by submitBatch is only rejected if the complete batch request has failed.
     */

    public onContractInformationFormSaveBtnPress () {
        const that = this;
        const form = this.byId("idDetailDetailContractInformation");
        const context = form?.getBindingContext() as any;
        const formData = context?.getObject();
        context.setProperty("CCMContractStartDate", formData?.CCMContractStartDate || "");
        context.setProperty("CCMContractEndDate", formData?.CCMContractEndDate || "");
        this.getModel()?.submitBatch("ContractInformation").then(function(){
            if (!context?.getBinding()?.hasPendingChanges()) {
                that.onContractInformationFormCancelBtnPress();
                that.publishEventEmitter("contractProductChannel", "contractDateChanged");
                return;
            }

            if (context) {
                that.setMessageSection(context, "contractInformationDetailDetail");                
            }
            
        });
    }

    public async onChangeContractStartDate () {
        const form = this.byId("idDetailDetailContractInformation");
        const context = form?.getBindingContext() as any;
        if (context) {
            await context.setProperty("CCMContractEndDate", "");
        }
    }

    public formatMinDate (startDate: Date) {
        if (!startDate) return null;
    
        const oDate = new Date(startDate);
        oDate.setDate(oDate.getDate() + 1); // add 1 day
    
        return oDate;
    }
}
