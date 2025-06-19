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
    }

    public onMatched(event: Route$PatternMatchedEvent): void {
        const model = new JSONModel({
        })

        this.setModel(model, "detailPage");
        const routeParameters = event.getParameter("arguments") as TDetailRouteParameters;
        this.id = routeParameters.id;
        (this.getModel('appView') as JSONModel).setProperty("/layout", routeParameters.layout)
        this.bindTable();
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
        this.getRouter().navTo("detail-detail", { layout: "ThreeColumnsMidExpanded", id: this.id, productPackId: ccmContract.ProductCode });
    }

    public bindTable() {
        const Table = this.byId("idCCMContract") as Table;
        const ccmCustomerInfo = this.byId("idCCMCustomers");
        const ccmContractInfo = this.byId("idCCMContractInformation");
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
            path: "/CCMContractView",
            template: template,
            filters: filters,
            sorter: sorters,
            events: {
                dataReceived: (event: any) => {
                    const data = event.getSource()?.getContexts()[0]?.getObject();
                    if (data && data.CCMContractID) {
                        ccmCustomerInfo?.bindElement({
                            path: `/CCMContractView(CCMContractID='${data.CCMContractID}')`
                        });
                        ccmContractInfo?.bindElement({
                            path: `/CCMContractView(CCMContractID='${data.CCMContractID}')`
                        });
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
}