import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
export type TDetailDetailRouteParameters = {
    id:string;
    productPackId:string;
    layout:string;
}

/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Detail extends BaseController {
    private id: String;
    private productPackID: String;

    public onInit() {
        this.getRouter().getRoute("detail-detail")?.attachPatternMatched(this.onMatched, this);

    }

    public onMatched(event: Route$PatternMatchedEvent): void {
        const args = event.getParameter("arguments") as TDetailDetailRouteParameters;
        this.id = args.id;
        this.productPackID = args.productPackId;
        (this.getModel('appView') as JSONModel).setProperty("/layout", args.layout)
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
}
