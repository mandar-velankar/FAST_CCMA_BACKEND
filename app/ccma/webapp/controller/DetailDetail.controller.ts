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
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import * as formatter from "com/bayer/tender/ccma/model/formatter";
export type TDetailDetailRouteParameters = {
    id: string;
    productPackId: string;
    contractId: string;
    layout: string;
}

type SettlementDate = {
    CCMContractID?: string;
    FromDate: string;
    ToDate: string;
    SettlementID?: string;
}

type SettlementDateModel = {
    fromDate: string | Date | null;
    toDate: string | Date | null;
    fromValueState: string;
    toValueState: string;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    SettlementID: string;
}

/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Detail extends BaseController {
    private id: string;
    private productPackID: string;
    private contractId: string;
    public formatter = formatter;

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
        // this.bindRebateDiscountConditionTable();
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
            },
            events: {
                dataReceived: (event: any) => {
                    const uiModel = this.getModel("ui") as JSONModel;
                    const items = event.getSource().getBoundContext()?.getObject();
                    uiModel.setProperty("/ProductName", items.ProductName);
                    uiModel.setProperty("/hasExistingContract", items.ContractNumber ? true : false );
                }
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
            },
            events: {
                dataReceived: (event: any) => {
                    const uiModel = this.getModel("ui") as JSONModel;
                    const items = event.getSource().getBoundContext()?.getObject();
                    this.bindRebateDiscountConditionTable(items?.PriceConditionRebateID);
            }}

        });
    }

    public bindRebateDiscountConditionTable(PriceConditionRebateID) {
        const Table = this.byId("idRebateDisCondtTable") as Table;
        let template;
        const bindingInfo = Table?.getBindingInfo("items");
        template = (bindingInfo as any).template;


        const filters = [
            new Filter({
                path: 'PriceConditionRebateID',
                operator: FilterOperator.EQ,
                value1: PriceConditionRebateID
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
        (this.getModel() as ODataModel)?.resetChanges("contractInformationDetailDetail");
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
        this.getModel()?.submitBatch("contractInformationDetailDetail").then(function(){
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

    public onOpenSettlementCalendar() {
        let dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        let isDialogOpen = dialog && dialog.isOpen();

        if (!isDialogOpen) {
            dialog = Fragment.load({
                id: this.getView()?.getId(),
                name: "com.bayer.tender.ccma.view.fragments.detail-detail.SettlementCalendar",
                controller: this
            }).then((oDialog) => {
                this.getView()?.addDependent(oDialog);
                return oDialog;
            });
        } 

        dialog.then(async (dialog) => {
            dialog.open();
            // Load settlement calendar data
            await this.onLoadSettlementCalendarModel(dialog);
        });
    }

    private async onLoadSettlementCalendarModel(dialog: Dialog) {
        // Get existing settlement dates from the backend
        let settlementDates = await this.getSettlementDates();
        
        // If no existing dates, start with empty array
        if(settlementDates && settlementDates.length === 0){
            settlementDates = this.calculateSettlementCalendarProposal();
        }
        
        const settlementCalendarModel = new JSONModel({
            settlementDates: settlementDates,
            valid: true
        });
        dialog.setModel(settlementCalendarModel, "sc");
    }

    private getContractInfo() {
        const contractInfoForm = this.byId("idDetailDetailContractInformation");
        if (contractInfoForm) {
            const context = contractInfoForm.getBindingContext();
            if (context) {
                return context.getObject();
            }
        }
        return null;
    }

    public onCloseSettlementCalendar() {
        let dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        if (dialog && dialog.isOpen()) {
            dialog.close();
            dialog.destroy();
        }
    }

    public onDeleteRange(oEvent: any) {
        const source = oEvent.getSource();
        const bindingContext = source.getBindingContext("sc");
        const index = bindingContext.getPath().split("/")[2]; // Get index from path like "/settlementDates/0"
        
        const dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        const model = dialog.getModel("sc") as JSONModel;

        const contract = this.getContractInfo() as any;
        const rebateFormData = this.getRebateFormData() as any;

        let settlementDates = model.getProperty("/settlementDates") as SettlementDateModel[] || [];
        
        // Remove the item at the specified index
        settlementDates.splice(index, 1);
        settlementDates = this.calculateSettlementCalendarMinMaxDate(settlementDates, rebateFormData.RefundDate, contract.CCMContractEndDate);
        
        model.setProperty("/settlementDates", settlementDates);

        //Revalidate the settlement calendar
        this.isSettlementCalendarValid(model);

    }

    public onAdd() {
        const dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        const model = dialog.getModel("sc") as JSONModel;
        const contract = (this.getContractInfo() as any);
        const rebateFormData = this.getRebateFormData() as any;
        let settlementDates = model.getProperty("/settlementDates") as SettlementDateModel[] || [];
        const lastFullDate = settlementDates[settlementDates.length-1]?.toDate;
        const lastDate = lastFullDate && this.getDateWithoutTime(new Date(lastFullDate));
        // Get contract start and end dates for min/max restrictions
        const contractEndDate = contract.CCMContractEndDate ? new Date(contract.CCMContractEndDate) : null;

        if(settlementDates && settlementDates.length > 0 && !lastDate){
				MessageBox.error(this.getText("ESRebateFragment.SettlementCalendarEmpytLine"));
				return;
        }
        if(lastDate && contractEndDate && lastDate.getTime() === contractEndDate.getTime()){
            MessageBox.error(this.getText("ESRebateFragment.SettlementCalendarCompleted"));
            return;
        }
        
        settlementDates = this.calculateSettlementCalendarMinMaxDate(settlementDates, rebateFormData.RefundDate, contract.CCMContractEndDate);

        // Add a new empty settlement date range
        settlementDates.push({
            fromDate: null,
            toDate: null,
            fromValueState: "None",
            toValueState: "None",
            minDate: rebateFormData.RefundDate ? new Date(rebateFormData.RefundDate) : null,
            maxDate: contractEndDate
        } as SettlementDateModel);
        
        model.setProperty("/settlementDates", settlementDates);
        model.setProperty("/valid", false); // Set to false since we have empty dates
    }

    public getDateWithoutTime (date: Date): Date {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }

    public getText(key: string, props?: any): string {
        return this.getModel("i18n").getResourceBundle().getText(key, props);
    }

    public onChangeSettlementDate(event: any, type: string) {
        const dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        const model = dialog.getModel("sc") as JSONModel;
        const path = event.getSource().getBindingContext("sc").getPath();
        const contract = this.getContractInfo() as any;
        const rebateFormData = this.getRebateFormData() as any;
        let settlementDates = model.getProperty("/settlementDates") as SettlementDateModel[] || [];
        
        model.setProperty(`${path}/${type}ValueState`,event.getSource().isValidValue() && !!event.getParameter("newValue")?"None":"Error");
        settlementDates = this.calculateSettlementCalendarMinMaxDate(settlementDates, rebateFormData.RefundDate, contract.CCMContractEndDate);
        model.setProperty("/settlementDates",settlementDates);
        this.isSettlementCalendarValid(model);
    }

    private convertToDate(dateValue: string | Date | null): Date | null {
        if (!dateValue) return null;
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === 'string') return new Date(dateValue);
        return null;
    }

    private formatDateForBackend(dateValue: string | Date | null): string | null {
        if (!dateValue) return null;
        const dateObj = this.convertToDate(dateValue);
        if (!dateObj || isNaN(dateObj.getTime())) return null;
        return dateObj.toISOString().split('T')[0];
    }

    public calculateSettlementCalendarMinMaxDate(settlementDates: SettlementDateModel[], refundDate: Date, expiryDate: Date): SettlementDateModel[] {
        for (const [idx, settlementDate] of settlementDates.entries()) {
            settlementDate.minDate = this.getPreviousSettlementDate(idx, settlementDates, new Date(refundDate), new Date(expiryDate));
            settlementDate.maxDate = this.getNextSettlementDate(idx, settlementDates, new Date(refundDate), new Date(expiryDate));
        }
        return settlementDates;
    }

    public getPreviousSettlementDate(idx: number, settlementDates: SettlementDateModel[], refundDate: Date, expiryDate: Date): Date | null {
        const prevSettlementDate = settlementDates[idx - 1];
        let prevDate = new Date(refundDate.getTime());
        if(prevSettlementDate?.toDate){
            prevDate = new Date(prevSettlementDate.toDate.getTime());
            prevDate.setDate(prevDate.getDate()+1);
        }
        if(prevDate.getTime()>expiryDate.getTime()){
            prevDate = new Date(expiryDate.getTime());
        }
        return prevDate;
    }
    public getNextSettlementDate (idx: number, settlementDates: SettlementDateModel[], refundDate: Date, expiryDate: Date): Date | null {
        const nextSettlementDate = settlementDates[idx + 1];
        let nextDate = new Date(expiryDate.getTime());
        if(nextSettlementDate?.fromDate){
            nextDate = new Date(nextSettlementDate.fromDate.getTime());
            nextDate.setDate(nextDate.getDate()-1);
        }
        if(nextDate.getTime()<refundDate.getTime()){
            nextDate = new Date(refundDate.getTime());
        }
        return nextDate;
    }

    private generateSettlementId(sapId: string, toDate: string | Date | null): string {
        if (!toDate) return '';
        
        const formattedToDate = this.formatDateForBackend(toDate);
        if (!formattedToDate) return '';
        
        if (sapId) {
            return `${sapId}-${formattedToDate}`;
        } else {
            return `${formattedToDate}`;
        }
    }

    private formatSettlementDateForBackend(dateValue: string | Date | null): string | null {
        return this.formatDateForBackend(dateValue);
    }

    public async onApply() {
        const dialog = this.byId("idSettlementCalendarDialog") as Dialog;
        const model = dialog.getModel("sc") as JSONModel;
        const settlementDates = model.getProperty("/settlementDates") as SettlementDateModel[] || [];
        const sapId = await this.getContractSAPID();
        const controller = this;

        const isValid = model.getProperty("/valid") as boolean;
        const isEmpty = settlementDates.length === 0;

        if (!isEmpty && !isValid) {
            MessageBox.error(this.getText("ESRebateFragment.SettlementCalendarErrors"));
            return;
        }

        const emptyRanges = settlementDates.filter(sd => !sd.toDate && !sd.fromDate) || [];
        if (emptyRanges.length > 0) {
            MessageBox.error(this.getText("ESRebateFragment.SettlementCalendarEmptyRanges"));
            return;
        }

        try {
            BusyIndicator.show();
            const existingDates = await this.getSettlementDates(); // from DB

            // Normalize dates into Edm.Date (YYYY-MM-DD)
            const normalize = (d: SettlementDateModel) => ({
                FromDate: this.formatSettlementDateForBackend(d.fromDate),
                ToDate: this.formatSettlementDateForBackend(d.toDate),
                SettlementID: this.generateSettlementId(sapId, d.toDate)
            });

            // Maps
            const existingMap = new Map<string, any>(
                existingDates.map(d => {
                    const nd = normalize(d);
                    return [`${this.contractId}_${nd.FromDate}`, nd];
                })
            );

            const uiMap = new Map<string, any>(
                settlementDates.map(d => {
                    const nd = normalize(d);
                    return [`${this.contractId}_${nd.FromDate}`, nd];
                })
            );

            // === DELETE === (DB entry not in UI)
            for (const [key, dbRecord] of existingMap) {
                if (!uiMap.has(key)) {
                    const oBinding = this.getModel()?.bindContext(`/SettlementsDate(CCMContractID='${this.contractId}',FromDate='${dbRecord.FromDate}')`, null, { $$groupId: "settlementCalendar" });
                    // Wait until bound context is available
                   oBinding.requestObject().then(function () {
                        const oCtx = oBinding.getBoundContext();
                        oCtx.delete("$auto");
                    });
                }
            }

            // === CREATE / UPDATE ===
            for (const [key, uiRecord] of uiMap) {
                if (!existingMap.has(key)) {
                    // CREATE new row
                    const listBinding = this.getModel()?.bindList("/SettlementsDate");
                    listBinding?.create({
                        CCMContractID: this.contractId,
                        FromDate: uiRecord.FromDate,
                        ToDate: uiRecord.ToDate,
                        SettlementID: uiRecord.SettlementID
                    }, true);

                } else {
                    const dbRecord = existingMap.get(key);

                    // === UPDATE (only ToDate is allowed to change)
                    if (dbRecord.ToDate !== uiRecord.ToDate) {
                        const context = this.getModel()?.bindContext(`/SettlementsDate(CCMContractID='${this.contractId}',FromDate='${dbRecord.FromDate}')`, undefined, {
                            $$groupId: "settlementCalendar"
                        }).getBoundContext();
                        context?.setProperty("ToDate", uiRecord.ToDate, "settlementCalendar");
                        context?.setProperty("SettlementID", this.generateSettlementId(sapId, uiRecord.ToDate), "settlementCalendar");
                    }
                }
            }

            // === Submit all changes ===
            await this.getModel()?.submitBatch("settlementCalendar");

            MessageBox.success("Settlement calendar saved successfully.");
            this.onCloseSettlementCalendar();
        } catch (error) {
            console.error("Error saving settlement calendar:", error);
            MessageBox.error("Error saving settlement calendar: " + (error as Error).message);
        } finally {
            BusyIndicator.hide();
        }
    }




    private getSettlementDates(): Promise<SettlementDateModel[]> {
        return new Promise((resolve, reject) => {
            const oModel = this.getModel() as ODataModel;
            const filters = [
                new Filter("CCMContractID", FilterOperator.EQ, this.contractId)
            ];
            const binding = oModel.bindList("/SettlementsDate", undefined, undefined, filters);
            binding.requestContexts().then(
                (contexts) => {
                    const settlementDates = contexts.map(ctx => {
                        const data = ctx.getObject() as SettlementDate;
                        // Return dates as provided by the backend
                        return {
                            fromDate: new Date(data.FromDate),
                            toDate: new Date(data.ToDate),
                            fromValueState: "None",
                            toValueState: "None",
                            SettlementID: data.SettlementID
                        } as SettlementDateModel;
                    });
                    resolve(settlementDates);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    private async getContractSAPID(): Promise<string> {
        return new Promise((resolve, reject) => {
            const oModel = this.getModel() as ODataModel;
            // Query the ContractPayloadView to get the SAPID
            const filters = [
                new Filter("ID", FilterOperator.EQ, this.id)
            ];
            const binding = oModel.bindList("/FastConditionContractsView", undefined, undefined, filters);
            binding.requestContexts().then(
                (contexts) => {
                    if (contexts && contexts.length > 0) {
                        const data = contexts[0].getObject() as any;
                        const sapId = data.SAPID || '';
                        resolve(sapId);
                    } else {
                        resolve('');
                    }
                },
                (error) => {
                    console.log("Error retrieving SAPID:", error);
                    reject(error);
                }
            );
        });
    }

    private getRebateFormData() {
        // Get the rebate form which should have the data
        const rebateForm = this.byId("idRebateForm");
        if (rebateForm) {
            const context = rebateForm.getBindingContext();
            if (context) {
                return context.getObject()
            }
        }
        return null;
    }

    public isSettlementCalendarValid (model: JSONModel){
        const settlementDates = model.getProperty("/settlementDates") as SettlementDateModel[] || [];
        const isValid = settlementDates.filter(settlementDate => settlementDate.toValueState === "Error" || settlementDate.fromValueState === "Error" ) || [];
        model.setProperty("/valid",(isValid.length === 0));
    }

    public calculateSettlementCalendarProposal (){
        const contract = (this.getContractInfo() as any);
        const rebateFormData = this.getRebateFormData() as any;
        const settlementId = rebateFormData.SettlementDescription;
        const months = formatter?.getLiquidationInMonths(rebateFormData.Liquidation);
        let settlementDates: any = [];
        switch (settlementId) {
            case 'Validity':
                settlementDates.push({
                    fromDate: new Date(rebateFormData.RefundDate),
                    toDate: new Date(contract.CCMContractEndDate),
                    minDate: new Date(rebateFormData.RefundDate),
                    maxDate: new Date(contract.CCMContractEndDate)
                });
                break;
            case 'Frequency':
                let dateFrom = new Date(rebateFormData.RefundDate);
                let idx = 0;
                do {
                    let dateTo = new Date(dateFrom.getTime());
                    dateTo.setMonth(dateTo.getMonth() + months);
                    dateTo.setDate(dateTo.getDate() - 1 );
                    settlementDates.push({
                        fromDate:new Date(dateFrom.getTime()),
                        toDate:new Date(dateTo.getTime())//,
                        // minDate: this.getPreviousSettlementDate(idx,settlementDates),
                        // maxDate: this.getNextSettlementDate(idx,settlementDates)
                    });
                    dateFrom.setMonth(dateFrom.getMonth() + months);
                    idx++;
                } while (new Date(dateFrom) < new Date(contract.CCMContractEndDate));
                //set last record todate with expirydate value
                if(settlementDates.length > 0){
                    settlementDates[settlementDates.length-1].toDate = new Date(contract.CCMContractEndDate);
                }
                settlementDates = this.calculateSettlementCalendarMinMaxDate(settlementDates, rebateFormData.RefundDate, contract.CCMContractEndDate);
                break;
            default:
                break;
        }
        return settlementDates;
    }
}
