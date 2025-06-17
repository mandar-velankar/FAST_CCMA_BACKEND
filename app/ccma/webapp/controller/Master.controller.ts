import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { semantic } from "sap/m/library";
type TContract = {
    ID : string;
}


/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Master extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit() {
        // TODO: Remove after binding implementation
        const model = new JSONModel({
        })

        this.setModel(model, "masterModel");

    }

    public async onListItemPress(event:RowActionItem$PressEvent) {        
        const ID = (event.getParameter("row")?.getBindingContext("masterModel")?.getObject() as TContract).ID;
        this.getRouter().navTo("detail", { layout: "TwoColumnsMidExpanded", id: ID });
    }
}