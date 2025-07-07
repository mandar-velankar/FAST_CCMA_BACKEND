import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Button, { } from "sap/m/Button"
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from "sap/m/MessageBox";
import { Button$PressEvent } from "sap/ui/commons/Button";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import Sorter from "sap/ui/model/Sorter";
import Table from "sap/m/Table";
export type TDetailDetailRouteParameters = {
    id: string;
    productPackId: string;
    contractId: string;
    layout: string;
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
            hasPricingFOC: false,
            minDate: new Date(),
        });

        const messagesModel = new JSONModel({
            contractInformationDetailDetail: []
        });
                
        this.setModel(messagesModel, "messages");
        this.setModel(oModel, "ui");

    }

    public async onMatched(event: Route$PatternMatchedEvent): void {
        const args = event.getParameter("arguments") as TDetailDetailRouteParameters;
        this.id = args.id;
        this.productPackID = args.productPackId;
        this.contractId = args.contractId;
        (this.getModel('appView') as JSONModel).setProperty("/layout", args.layout);
        this.bindContractInformationForm();
        this.bindPricingForm();
        this.bindFOCTable()
        this.bindRebateForm()
        this.bindRebateDiscountConditionTable();
        await this.loadAndSetMaterialText(this.contractId, this.productPackID);
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

    public bindContractInformationForm() {
        const form = this.byId("idDetailDetailContractInformation");
        const path = `/CCMContractInformationDetailDetailView('${this.contractId}')`;
        form?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "contractInformationDetailDetail"
            }
        });
    }

    public bindPricingForm() {
        const ccmCustomerInfo = this.byId("idNewPricingForm");
        const path = `/CCMContractPricingFormView(CCMContractID='${this.contractId}')`; 
        ccmCustomerInfo?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "PricingFormDetailDetail"
            }
        });
    }

    public bindRebateForm() {
        const ccmCustomerInfo = this.byId("idRebateForm");
        const path = `/CCMContractRebateFormView(CCMContractID='${this.contractId}')`; 
        ccmCustomerInfo?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "RebateFormDetailDetail"
            }
        });
    }

    public bindRebateDiscountConditionTable() {
        const Table = this.byId("idRebateDisCondtTable") as Table;
        let template;
        const bindingInfo = Table?.getBindingInfo("items");
        template = (bindingInfo as any).template;


        const filters = [
            new Filter({
                path: 'CCMContractID',
                operator: FilterOperator.EQ,
                value1: this.contractId
            })
        ];

        Table?.bindItems({
            path: "/CCMContractRebateDiscountConditionTableView",
            template: template,
            filters: filters,
            parameters: {
                $$updateGroupId: "RebateDiscountConditionTable"
            }
        });
    }

    public bindFOCTable() {
        const Table = this.byId("idFocTable") as Table;
        let template;
        const bindingInfo = Table?.getBindingInfo("items");
        template = (bindingInfo as any).template;


        const filters = [
            new Filter({
                path: 'CCMContractID',
                operator: FilterOperator.EQ,
                value1: this.contractId
            })
        ];

        Table?.bindItems({
            path: "/CCMContractFOCTableView",
            template: template,
            filters: filters,
            parameters: {
                $$updateGroupId: "FOCTable"
            },
            events: {
                dataReceived: this.focDataReceived.bind(this)
            }
        });
    }

    private focDataReceived () {
        const uiModel = this.getModel("ui") as JSONModel;
        const table = this.byId("idFocTable") as Table;
        const items = table.getItems();
        uiModel.setProperty("/hasPricingFOC", !!(items && items.length > 0));
    }

    public onContractInformationFormEditBtnPress() {
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

    public onContractInformationFormSaveBtnPress() {
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

    public async onChangeContractStartDate() {
        const form = this.byId("idDetailDetailContractInformation");
        const context = form?.getBindingContext() as any;
        if (context) {
            await context.setProperty("CCMContractEndDate", "");
        }
    }

    public formatMinDate(startDate: Date) {
        if (!startDate) return null;

        const oDate = new Date(startDate);
        oDate.setDate(oDate.getDate() + 1); // add 1 day

        return oDate;
    }

    public onCreateCCMContract(event: Button$PressEvent): void {

        BusyIndicator.show();
        const ccmContractContextBinding = this.getModel()?.bindContext("/createCCMContract(...)");
        ccmContractContextBinding?.setParameter("FastCCMContractId", this.id);
        ccmContractContextBinding?.setParameter("CCMContractID", this.contractId);
        ccmContractContextBinding?.setParameter("ProductCode", this.productPackID);
        ccmContractContextBinding?.execute().then(
            () => {
                const oActionContext = ccmContractContextBinding.getBoundContext();
                this.onCreateCCMContractSuccess(oActionContext?.getObject());
            },
            (error: any) => {
                this.onCreateCCMContractFail(error);
            }
        );
    }

    public onCreateCCMContractSuccess(res: any): void {
        MessageBox.success(res?.value);
        BusyIndicator.hide();
    }

    public onCreateCCMContractFail(res: any): void {
        BusyIndicator.hide();

        let message = "An unexpected error occurred. Please contact SAP support.";

        if (res?.responseText) {
            try {
                const response = JSON.parse(res.responseText);
                message = response.error?.message?.value || response.message || message;
            } catch {
            }
        } else if (res?.message) {
            message = res.message;
        }

        MessageBox.error(message);
    }

    public async loadAndSetMaterialText(contractId: string, productCode: string): Promise<void> {
        const oModel = this.getModel() as ODataModel;
        const uiModel = this.getModel("ui") as JSONModel;
        // Create filters for contractId and productCode
        const filters = [
            new Filter("CCMContract_ID", FilterOperator.EQ, contractId),
            new Filter("ProductCode", FilterOperator.EQ, productCode)
        ];
        const binding = oModel.bindList("/CCMMaterial", undefined, undefined, filters);
        try {
            const materials = await binding.requestContexts();
            const materialObjects = materials.map(ctx => ctx.getObject() as { MaterialNumber: string; ActiveRecord: number });
            const text = materialObjects.map(mat => {
                const status = mat.ActiveRecord === 1 ? "Active" : "Inactive";
                return `${mat.MaterialNumber} - ${status}`;
            }).join(",\n");
            const lineCount = text ? text.split("\n").length : 1;
            uiModel?.setProperty("/materialsText", text);
            uiModel?.setProperty("/materialRowCount", Math.max(lineCount, 2));
        } catch (err) {
            // handle error as needed
        }
    }

    public onSendFOCInteractMail(event: Button$PressEvent): void {

        BusyIndicator.show();
        const focInteractContextBinding = this.getModel()?.bindContext("/sendFOCToInteractMail(...)");
        focInteractContextBinding?.setParameter("FastCCMContractId", this.id);
        focInteractContextBinding?.setParameter("CCMContractID", this.contractId);
        focInteractContextBinding?.setParameter("ProductCode", this.productPackID);
        focInteractContextBinding?.execute().then(
            () => {
                const oActionContext = focInteractContextBinding.getBoundContext();
                this.onSendFOCInteractMailSuccess(oActionContext?.getObject());
            },
            (error: any) => {
                this.onSendFOCInteractMailFail(error);
            }
        );
    }

    public onSendFOCInteractMailSuccess(res: any): void {
        MessageBox.success(res?.value);
        BusyIndicator.hide();
    }

    public onSendFOCInteractMailFail(res: any): void {
        BusyIndicator.hide();

        let message = "An unexpected error occurred. Please contact SAP support.";

        if (res?.responseText) {
            try {
                const response = JSON.parse(res.responseText);
                message = response.error?.message?.value || response.message || message;
            } catch {
            }
        } else if (res?.message) {
            message = res.message;
        }

        MessageBox.error(message);
    }
}
