import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";


/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class App extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        let oViewModel,
            fnSetAppNotBusy,
            iOriginalBusyDelay = this.getView()?.getBusyIndicatorDelay();

        oViewModel = new JSONModel({
            busy: false,
            delay: 0,
            layout: "OneColumn",
            previousLayout: "",
            actionButtonsInfo: {
                midColumn: {
                    fullScreen: false
                },
                endColumn: {                        // <-- Add this block
                    fullScreen: false
                }
            },
            language: "en"
        });
        this.setModel(oViewModel, "appView");

    }
}