import BaseObject from "sap/ui/base/Object";
import Log from "sap/base/Log";
import type List from "sap/m/List";
/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class ListSelector extends BaseObject {
    private _oList?: List;
    private _oDetailList?: List;
    private _fnResolveListHasBeenSet: (oList: List) => void;
    private _fnResolveListHasBeenSetForDetail: (oList: List) => void;
    public oWhenListLoadingIsDone: Promise<{ list: List }>;
    public oWhenListLoadingIsDoneForDetail: Promise<{ list: List }>;
    private _oWhenListHasBeenSet: Promise<List>;
    private _oWhenListHasBeenSetForDetail: Promise<List>;

    constructor() {
        super();
        this._oWhenListHasBeenSet = new Promise<List>((resolve) => {
            this._fnResolveListHasBeenSet = resolve;
        });
        this.oWhenListLoadingIsDone = new Promise<{ list: List }>((resolve, reject) => {
            this._oWhenListHasBeenSet.then((oList) => {
                oList.getBinding("items")?.attachEventOnce("dataReceived", () => {
                    if (oList.getItems().length) {
                        resolve({ list: oList });
                    } else {
                        reject({ list: oList });
                    }
                });
            });
        });
        this._oWhenListHasBeenSetForDetail = new Promise<List>((resolve) => {
            this._fnResolveListHasBeenSetForDetail = resolve;
        });
        this.oWhenListLoadingIsDoneForDetail = new Promise<{ list: List }>((resolve, reject) => {
            this._oWhenListHasBeenSetForDetail.then((oList) => {
                oList.getBinding("items")?.attachEventOnce("dataReceived", () => {
                    if (oList.getItems().length) {
                        resolve({ list: oList });
                    } else {
                        reject({ list: oList });
                    }
                });
            });
        });
    }

    /**
     * A bound list should be passed in here. Should be done, before the list has received its initial data from the server.
     * May only be invoked once per ListSelector instance.
     * @param oList The list all the select functions will be invoked on.
     */
    public setBoundMasterList(oList: List) {
        this._oList = oList;
        this._fnResolveListHasBeenSet(oList);
    }

    public setBoundDetailList(oList: List) {
        this._oDetailList = oList;
        this._fnResolveListHasBeenSetForDetail(oList);
    }

    /**
     * Tries to select and scroll to a list item with a matching binding context. If there are no items matching the binding context or the ListMode is none,
     * no selection/scrolling will happen
     * @param sBindingPath the binding path matching the binding path of a list item
     */
    public selectAListItem(sBindingPath: string) {
        this.oWhenListLoadingIsDone.then(
            () => {
                const oList = this._oList;
                if (!oList) return;
                if ((oList as any).getMode() === "None") {
                    return;
                }
                const oSelectedItem = (oList as any).getSelectedItem?.();
                if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sBindingPath) {
                    return;
                }
                (oList as any).getItems().some((oItem: any) => {
                    if (oItem.getBindingContext() && oItem.getBindingContext().getPath() === sBindingPath) {
                        oList.setSelectedItem(oItem);
                        return true;
                    }
                });
            },
            () => {
                Log.warning("Could not select the list item with the path" + sBindingPath + " because the list encountered an error or had no items");
            }
        );
    }

    /**
     * Removes all selections from master list.
     * Does not trigger 'selectionChange' event on master list, though.
     */
    public clearMasterListSelection() {
        this._oWhenListHasBeenSet.then(() => {
            this._oList?.removeSelections(true);
        });
    }

    public clearDetailListSelection() {
        this._oWhenListHasBeenSetForDetail.then(() => {
            this._oDetailList?.removeSelections(true);
        });
    }
}