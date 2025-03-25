import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
type TContract = {
    ProductPackID : string;
}
/**
 * @namespace com.bayer.tender.ccma.controller
 */

export default class Detail extends BaseController {
    id: String;

    public onInit() {
        this.getRouter().getRoute("detail")?.attachPatternMatched(this._onMatched, this);
    }

    public _onMatched(event: any): void{
        const model = new JSONModel({
            products: [
                {
                    ProductPackName: "BETAFERON LYO VL 4X3+SLV PFS 4X3 TPCK ES",
                    ProductPackID: 205446
                }
            ]
        })

        this.setModel(model, "detailPage");
        const args = event.getParameter("arguments");
        this.id = args.id;
        (this.getModel('appView') as JSONModel).setProperty("/layout", args.layout)
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
        var bFullScreen = this.getModel("appView")?.getProperty("/actionButtonsInfo/midColumn/fullScreen");
        (this.getModel('appView') as JSONModel).setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
        if (!bFullScreen) {
            // store current layout and go full screen
            (this.getModel('appView') as JSONModel).setProperty("/previousLayout", this.getModel("appView")?.getProperty("/layout"));
            (this.getModel('appView') as JSONModel).setProperty("/layout", "MidColumnFullScreen");
        } else {
            // reset to previous layout
            (this.getModel('appView') as JSONModel).setProperty("/layout", this.getModel("appView")?.getProperty("/previousLayout"));
        }
    }

    public async onListItemPress(event:RowActionItem$PressEvent) {
        const ProductPackID = (event.getParameter("row")?.getBindingContext("detailPage")?.getObject() as TContract).ProductPackID;
        this.getRouter().navTo("detail-detail", { layout: "ThreeColumnsMidExpanded", id: this.id, productPackId: ProductPackID });
    }
}