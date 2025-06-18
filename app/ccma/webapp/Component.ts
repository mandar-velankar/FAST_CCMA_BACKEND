import UIComponent from "sap/ui/core/UIComponent";
import Device from "sap/ui/Device";
import * as models from "./model/models";
import JSONModel from "sap/ui/model/json/JSONModel";
import * as library from "sap/f/library";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import ListSelector from "./controller/ListSelector";
import ErrorHandler from "./controller/ErrorHandler";

const LayoutType = (library as any).LayoutType;
/**
 * @namespace com.bayer.tender.ccma
 */
export default class Component extends UIComponent {
    public static metadata = {
        manifest: "json"
    };
    public oListSelector: ListSelector;
    // public _oErrorHandler: ErrorHandler;
    private _sContentDensityClass?: string;

    public init(): void {
        this.oListSelector = new ListSelector();
        // this._oErrorHandler = new ErrorHandler(this);
        super.init();
        const oModel = new JSONModel();
        this.setModel(oModel, "ui");
        this.getRouter().initialize();
        this.setModel(models.createDeviceModel(), "device");
    }

    public getHelper() {
        const oFCL = (this.getRootControl() as any).byId("fcl");
        const oSettings = {
            defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
            defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
            initialColumnsCount: 2
        };
        return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
    }

    public getContentDensityClass(): string {
        if (this._sContentDensityClass === undefined) {
            if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                this._sContentDensityClass = "";
            } else if (!(Device as any).support.touch) {
                this._sContentDensityClass = "sapUiSizeCompact";
            } else {
                this._sContentDensityClass = "sapUiSizeCozy";
            }
        }
        return this._sContentDensityClass;
    }

    public destroy(): void {
        this.oListSelector.destroy();
        // this._oErrorHandler.destroy();
        super.destroy();
    }
}