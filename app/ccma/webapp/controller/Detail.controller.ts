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
            }
        });
    }

    public bindTable() {
        const Table = this.byId("idCCMContract") as Table;
        const ccmCustomerInfo = this.byId("idCCMCustomers");
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
                    const data = event.getSource()?.getContexts()[0]?.getObject();
                    if (data && data.ID) {
                        ccmCustomerInfo?.bindElement({
                            path: `/CCMContractView(CCMContractID='${data.ID}')`
                        });
                        // ccmContractInfo?.bindElement({
                        //     path: `/CCMContractView(CCMContractID='${data.CCMContractID}')`
                        // });
                    }
                }
            }
        });
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

        context.setProperty("ContractStartDate", formData?.ContractStartDate || "");
        context.setProperty("ContractEndDate", formData?.ContractEndDate || "");

        

        this.getModel()?.submitBatch("ContractInformationDetail").then(async function(){
            if (!form?.getBindingContext()?.getBinding()?.hasPendingChanges()) {
                contractTable?.getItems()?.forEach(pr => {
                    pr.getBindingContext().setProperty("CCMContractStartDate", formData?.ContractStartDate || "");  
                    pr.getBindingContext().setProperty("CCMContractEndDate", formData?.ContractEndDate || "");  
                });
                await that.getModel()?.submitBatch("ContractTable")
                that.onContractInformationFormCancelBtnPress();
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


}