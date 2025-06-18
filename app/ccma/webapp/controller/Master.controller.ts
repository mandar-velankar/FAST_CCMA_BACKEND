import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import { semantic } from "sap/m/library";
import List from "sap/m/List";
import Component from "../Component";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import ListBinding from "sap/ui/model/ListBinding";
import Event from "sap/ui/base/Event";
import Popup from "sap/ui/core/Popup";
import * as formatter from "com/bayer/tender/ccma/model/formatter";
type TContract = {
	ID: string;
}


/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Master extends BaseController {
	public formatter = formatter;
	_oList: List;
	_oListFilterState: { aFilter: [], aSearch: [] };
	orFilters: [];
	andFilters: [];
    oSelCol?: string;
    _oPopover?: any;
    _bKeyboard?: boolean;

	/*eslint-disable @typescript-eslint/no-empty-function*/
	public onInit() {
		// TODO: Remove after binding implementation

		let oList = this.byId("idContractsMasterTable");
		const model = new JSONModel({
		});

		this._oList = oList as List;
		// keeps the filter and search state
		this._oListFilterState = {
			aFilter: [],
			aSearch: []
		};

		this.orFilters = [];
		this.andFilters = [];

		this.getRouter()?.getRoute("master")?.attachPatternMatched(this._onMasterMatched, this);
		this.getRouter().attachBypassed(this.onBypassed, this);

		this.setModel(model, "masterModel");

		this.getView()?.addEventDelegate({
			onBeforeFirstShow: () => {
				(this.getOwnerComponent() as Component).oListSelector.setBoundMasterList(this._oList);
			}
		});
	}

	public async onListItemPress(event: Event) {
		// For sap.m.Table itemPress event
		const listItem = (event as any).getSource();
		const context = listItem.getBindingContext();
		const data = context.getObject() as TContract;
		this.getRouter().navTo("detail", { layout: "TwoColumnsMidExpanded", id: data.ID });
	}

	async _onMasterMatched(event: Route$PatternMatchedEvent) {
		//Set the layout property of the FCL control to 'OneColumn'
		(this.getModel("appView") as JSONModel)?.setProperty("/layout", "OneColumn");

		this.setFilter();

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

	onBypassed() {
		this._oList.removeSelections(true);
	}

	setFilter() {
		let orFilters = [];
		let andFilters = [];

		const contractsMasterTable = this.byId('idContractsMasterTable');
		const binding = contractsMasterTable?.getBinding('items');

		let sSearch = this.byId("idSearch")?.getProperty("value");

		if (sSearch.length > 0) {

			orFilters.push(new Filter({
				path: "OfferID",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Reference",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));


			orFilters.push(new Filter({
				path: "Classification",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "InstituteName",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Owner",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Division",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			if (/^\d+$/.test(sSearch)) {
				orFilters.push(new Filter({
					path: "CustomerCode",
					operator: FilterOperator.EQ,
					value1: parseInt(sSearch)
				}));
			}

			andFilters.push(new Filter(orFilters, false));
		}

		if (andFilters.length > 0) {
			var oFilters = new Filter(andFilters, true);

			//Binding to table with the filters and the sorters
			(this.getView()?.byId("list")?.getBinding("items") as ListBinding)?.filter(oFilters, FilterType.Application);
		} else {
			(binding as ListBinding)?.filter();

		}

		if (this.getView()?.byId("list")?.getBinding("items")?.isSuspended()) {
			this.getView()?.byId("list")?.getBinding("items")?.resume();
		}

	}

}