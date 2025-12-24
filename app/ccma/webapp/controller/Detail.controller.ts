import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Popup from "sap/ui/core/Popup";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import Sorter from "sap/ui/model/Sorter";
import Table from "sap/m/Table";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import MessageBox from "sap/m/MessageBox";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import ColumnListItem from "sap/m/ColumnListItem";
import Text from "sap/m/Text";
type TDetailRouteParameters = {
    id: string;
    layout: string;
}
type TContract = {
    ProductPackID: string;
}
/**
 * @namespace com.bayer.tender.ccma.controller
 */

export default class Detail extends BaseController {
    private id: string;
    oSelCol?: string;
    _oPopover?: any;
    _bKeyboard?: boolean;

    public onInit() {
        this.getRouter().getRoute("detail")?.attachPatternMatched(this.onMatched, this);
        this.getRouter().getRoute("detail-detail")?.attachPatternMatched(this.onMatched, this);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
        const oModel: JSONModel = new JSONModel({
                busy: false,
                delay: 0,
                editMode: false,
                ContractInformationForm: {
                    busy: false,
                    delay: 0,
                    editMode: false,
                },
                minDate: today,
                maxDate: maxDate,
                isCustomerHierarchyVisible: false,
            });

            const messagesModel = new JSONModel({
                contractInformationDetail: []
            });
                    
            this.setModel(messagesModel, "messages");
            this.setModel(oModel, "ui");

            this.subscribeEventEmitter("contractProductChannel", "contractDateChanged", this.refreshContractTable.bind(this));
    }

    public onMatched(event: Route$PatternMatchedEvent): void {
        const model = new JSONModel({
        })

        this.setModel(model, "detailPage");
        const routeParameters = event.getParameter("arguments") as TDetailRouteParameters;
        this.id = routeParameters.id;
        (this.getModel('appView') as JSONModel).setProperty("/layout", routeParameters.layout)
        this.bindTable();
        this.bindContractInformationForm();
        this.bindCustomerForm();
        this.bindOwners();

        this.unbindCustomerHierarchyTable()
    }

    /**
     * Set the full screen mode to false and navigate to master page
     */
    public onCloseDetailPress() {
        (this.getModel('appView') as JSONModel).setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
        (this.getModel('appView') as JSONModel).setProperty("/layout", "OneColumn")
        this.getRouter().navTo("master");
    }

    /**
     * Toggle between full and non full screen mode.
     */
    public toggleFullScreen() {
        const isFullScreen = this.getModel("appView")?.getProperty("/actionButtonsInfo/midColumn/fullScreen");
        (this.getModel('appView') as JSONModel).setProperty("/actionButtonsInfo/midColumn/fullScreen", !isFullScreen);
        if (!isFullScreen) {
            // store current layout and go full screen
            (this.getModel('appView') as JSONModel).setProperty("/previousLayout", this.getModel("appView")?.getProperty("/layout"));
            (this.getModel('appView') as JSONModel).setProperty("/layout", "MidColumnFullScreen");
        } else {
            // reset to previous layout
            (this.getModel('appView') as JSONModel).setProperty("/layout", this.getModel("appView")?.getProperty("/previousLayout"));
        }
    }

    public async onListItemPress(event: Event) {
        const listItem = (event as any).getSource();
        const context = listItem.getBindingContext();
        const ccmContract = context.getObject();
        this.getRouter().navTo("detail-detail", { layout: "ThreeColumnsMidExpanded", id: this.id, contractId: ccmContract.ID, productPackId: ccmContract.ProductCode });
    }

    private bindContractInformationForm() {
        const ccmContractInfo = this.byId("idCCMContractInformation");
        const path = `/CCMContractInformationDetailView('${this.id}')`; 
        ccmContractInfo?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "ContractInformationDetail"
            },
            events: {
                dataReceived: async (event: any) => {
                    const uiModel = this.getModel("ui") as JSONModel;
                    const items = event.getSource().getBoundContext()?.getObject();
                    let bAllContractsHaveNumber = items?.CCMContract?.every(function (contract) {
                        return !!contract.ContractNumber;
                    });
                    uiModel.setProperty("/hasExistingContract", bAllContractsHaveNumber);

                    const contractIDs: string[] = items?.CCMContract?.map((c: any) => c.ID) || [];

                    let showExtensionFields = false;
                    if(items?.ContractType === "Tender"){
                        uiModel.setProperty("/showExtensionFields", showExtensionFields);
                    }else{
                        try {
                            const allConditionTypes = await Promise.all(
                                contractIDs.map(id => this.fetchConditionTypesByContractID(id))
                            );

                            const flatConditionTypes = allConditionTypes.flat();

                            const allPVL =
                                flatConditionTypes.length > 0 &&
                                flatConditionTypes.every(type => type === "PVL");

                            uiModel.setProperty("/showExtensionFields", !allPVL);
                        } catch (error) {
                            console.error("Error fetching condition types:", error);
                            uiModel.setProperty("/showExtensionFields", false);
                        }
                    } 
                }
            }
            
        });
    }

    private bindCustomerForm() {
        const ccmCustomerInfo = this.byId("idCCMCustomers");
        const path = `/CCMContractView(FastConditionContractsID='${this.id}')`; 
        ccmCustomerInfo?.bindElement({
            path: path,
            parameters: {
                $$updateGroupId: "CustomerInformationDetail",
                $select: "CCMContractID,CCMCustomerID"
            },
            events: {
                dataReceived: (event: any) => {
                    const data = event?.getSource()?.getBoundContext()?.getObject();
                    if (data) {
                        this.getModel("ui").setProperty("/AssortmentContractIDs", {
                            CCMContractID: data?.CCMContractID,
                            CCMCustomerID: data?.CCMCustomerID
                        });
                    }
                }
            }
        });
    }

    public bindTable() {
        const Table = this.byId("idCCMContract") as Table;
        // const ccmCustomerInfo = this.byId("idCCMCustomers");
        // const ccmContractInfo = this.byId("idCCMContractInformation");
        let template;
        const bindingInfo = Table?.getBindingInfo("items");
        template = (bindingInfo as any).template;


        const filters = [
            new Filter({
                path: 'FastConditionContractsID',
                operator: FilterOperator.EQ,
                value1: this.id
            })
        ];

        // Add sorting by RowOrder
        const sorters = [
            new Sorter({
                path: "ProductName",
                descending: false
            })
        ];

        Table?.bindItems({
            path: "/CCMContractProductsView",
            template: template,
            filters: filters,
            sorter: sorters,
            parameters: {
                $$updateGroupId: "ContractTable"
            },
            events: {
                dataReceived: (event: any) => {
                    // const data = event.getSource()?.getContexts()[0]?.getObject();
                    // if (data && data.ID) {
                    //     ccmCustomerInfo?.bindElement({
                    //         path: `/CCMContractView(CCMContractID='${data.ID}')`
                    //     });
                        // ccmContractInfo?.bindElement({
                        //     path: `/CCMContractView(CCMContractID='${data.CCMContractID}')`
                        // });
                    }
                }
            }
        );
    }

    public onClick(event: Event) {
        // Get the column title that was clicked
        const source: any = event.getSource();
        this.oSelCol = source.getTitle();

        const oButton = source;

        if (!this._oPopover) {
            // Load the popover fragment only once
            this._oPopover = sap.ui.xmlfragment("com.bayer.tender.ccma.view.fragments.master.TableFilter", this);
            this.getView()?.addDependent(this._oPopover);
        }

        const eDock = Popup.Dock;
        this._oPopover.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
    }

    public onContractInformationFormEditBtnPress () {
        this.getUIModel()?.setProperty("/ContractInformationForm/editMode", true);
    }
    
    public onContractInformationFormCancelBtnPress () {
        (this.getModel() as ODataModel)?.resetChanges("ContractInformationDetail");
        (this.getModel() as ODataModel)?.resetChanges("ContractTable");
        this.getUIModel()?.setProperty("/ContractInformationForm/editMode", false);
        this.removeMessageFromMessageManager("contractInformationDetail");
    }

    public async onChangeContractStartDate () {
        const form = this.byId("idCCMContractInformation");
        const context = form?.getBindingContext() as any;
        if (context) {
            await context.setProperty("ContractEndDate", "");
        }
    }

    public formatMinDate (startDate: Date) {
        if (!startDate) return null;
    
        const oDate = new Date(startDate);
        oDate.setDate(oDate.getDate() + 1); // add 1 day
    
        return oDate;
    }

    public onContractInformationFormSaveBtnPress () {
        const that = this;
        const form = this.byId("idCCMContractInformation");
        const context = form?.getBindingContext() as any;
        const formData = context?.getObject();
        const contractTable = this.byId("idCCMContract");

        if (formData?.ExtensionPeriod > 12) {
            MessageBox.error("Extension period cannot exceed 12 months.");
            return;
        }
        context.setProperty("ContractStartDate", formData?.ContractStartDate || "");
        context.setProperty("ContractEndDate", formData?.ContractEndDate || "");

        

        this.getModel()?.submitBatch("ContractInformationDetail").then(async function(){
            if (!form?.getBindingContext()?.getBinding()?.hasPendingChanges()) {
                contractTable?.getItems()?.forEach(pr => {
                    pr.getBindingContext().setProperty("CCMContractStartDate", formData?.ContractStartDate || "");  
                    pr.getBindingContext().setProperty("CCMContractEndDate", formData?.ContractEndDate || "");  
                    pr.getBindingContext().setProperty("Extension", formData?.Extension);  
                    pr.getBindingContext().setProperty("ExtensionPeriod", formData?.ExtensionPeriod);  
                });
                await that.getModel()?.submitBatch("ContractTable")
                that.onContractInformationFormCancelBtnPress();
                that.publishEventEmitter("ContractMasterTableChannel", "updateContractMasterTable");
                return;
            }

            if (context) {
                that.setMessageSection(context, "contractInformationDetailDetail");                
            }
            
        });
    }

    public refreshContractTable () {
        const contractTable = this.byId("idCCMContract");
        contractTable?.getBinding("items")?.refresh();
    }

    public onCreateAllCCMContract(): void {

        BusyIndicator.show();
        const ccmFASTContractContextBinding = this.getModel()?.bindContext("/createAllCCMContract(...)");
        ccmFASTContractContextBinding?.setParameter("FastCCMContractId", this.id);
        ccmFASTContractContextBinding?.execute().then(
            () => {
                const oActionContext = ccmFASTContractContextBinding.getBoundContext();
                this.onCreateAllCCMContractSuccess(oActionContext?.getObject());
            },
            (error: any) => {
                this.onCreateAllCCMContractFail(error);
            }
        );
    }

    public onCreateAllCCMContractSuccess(res: any): void {
        const contractTable = this.byId("idCCMContract");

        MessageBox.success(res?.value);
        BusyIndicator.hide();
        contractTable?.getBinding("items")?.refresh();
    }

    public onCreateAllCCMContractFail(res: any): void {
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

    public bindOwners(){
        BusyIndicator.show();
        const getOwnersContextBinding = this.getModel()?.bindContext("/getESUsers(...)");
        getOwnersContextBinding?.execute().then(
            () => {
                const actionContext = getOwnersContextBinding.getBoundContext();
                this.onbindOwnersSuccess(actionContext?.getObject());
            },
            (error: any) => {
                this.onbindOwnersFail(error);
            }
        );
    }

    public onbindOwnersSuccess(res: any): void {
        BusyIndicator.hide();
        const uiModel = this.getModel("ui") as JSONModel;
        uiModel.setProperty("/owners", res?.value || []);
    }

    private onbindOwnersFail(error: any): void {
        BusyIndicator.hide();
        console.error("Error in getESUsers:", error);
    }

    private async fetchConditionTypesByContractID(contractID: string): Promise<string[]> {

        const sPath = `/CCMContractPricingFormView(CCMContractID='${contractID}')`;
        const context = this.getModel()?.bindContext(sPath);

        return context?.requestObject()?.then((oObject: any) => {
            return oObject?.ConditionType || "";
        }).catch(err => {
            console.error("Error fetching ConditionType for contract", contractID, err);
            return "";
        });
    }

    public onOpenCustomersHierarchyTable(): void {
        const uiModel = this.getModel("ui") as JSONModel;
        const isVisible = uiModel.getProperty("/isCustomerHierarchyVisible");

        this.bindCustomerHierarchyTable();
        uiModel.setProperty("/isCustomerHierarchyVisible", !isVisible);
    }

    public bindCustomerHierarchyTable() {
        const oTable = this.byId("idCustomersDialogTable") as Table;
        const bindingInfo = oTable?.getBindingInfo("items");
        if (bindingInfo) return; // already bound
        const assortmentContractIDs = this.getUIModel().getProperty("/AssortmentContractIDs");

        // Create a template for the table rows and bind
        const oTemplate = new ColumnListItem({
            cells: [
                new Text({ text: "{InstituteName}" }),
                new Text({ text: "{CustomerID}" }),
                new Text({ text: "{Excluded}"})
            ]
        });

        oTable.bindItems({ 
            path: "/CustomerHierarchy", 
            filters: [
                new Filter("CCMContractID", FilterOperator.EQ, assortmentContractIDs?.CCMContractID),
                new Filter("CCMCustomer_ID", FilterOperator.EQ, assortmentContractIDs?.CCMCustomerID)
            ],
            template: oTemplate 
        });
    }

    public unbindCustomerHierarchyTable() {
        const oTable = this.byId("idCustomersDialogTable") as Table;
        const uiModel = this.getModel("ui") as JSONModel;
        oTable.unbindItems();
        uiModel.setProperty("/isCustomerHierarchyVisible", false);
    }

}