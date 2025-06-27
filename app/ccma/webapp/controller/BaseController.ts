import Controller from "sap/ui/core/mvc/Controller";
import History from "sap/ui/core/routing/History";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import * as formatter from "../model/formatter"; 
import CustomPercentageType from "../model/datatypes/CustomPercentageType";
import PercentageType from "../model/datatypes/PercentageType";
import CustomNumberType from "../model/datatypes/CustomNumberType";
import CustomDecimalType from "../model/datatypes/CustomDecimalType";
import CustomCurrencyType from "../model/datatypes/CustomCurrencyType";
import MessagePopover from "sap/m/MessagePopover";
import MessageItem from "sap/m/MessageItem";
import MessageType from "sap/ui/core/message/MessageType";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Context from "sap/ui/model/odata/v4/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
type Message = {
	type: `{${string}}` | MessageType | "Error" | "Information" | "None" | "Success" | "Warning" | PropertyBindingInfo | undefined;
	message: string;
	additionalText:  string;
	description: string;
}
/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class BaseController extends Controller {
	/**
	 * Convenience method for accessing the router in every controller of the application.
	 * @public
	 * @returns {sap.ui.core.routing.Router} the router for this component
	 */

	public formatter = formatter;

	public customTypes: {
			percentage: PercentageType,
			number: CustomNumberType,
			decimal: CustomDecimalType,
			currency: CustomCurrencyType,
	}
	public getRouter(): Router {
		return (this.getOwnerComponent() as UIComponent).getRouter();
	}

	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @public
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	public getModel(name?: string) {
		return this.getView()?.getModel(name);
	}

	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @public
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	public setModel(model: Model, name?: string): void {
		this.getView()?.setModel(model, name);
	}

	/**
	 * Convenience method for getting the resource bundle.
	 * @public
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	public getResourceBundle(): ResourceBundle {
		return (((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle);
	}

	/**
	 * Event handler for navigating back.
	 * It there is a history entry we go one step back in the browser history
	 * If not, it will replace the current entry of the browser history with the master route.
	 * @public
	 */
	public onNavBack(): void {
		const sPreviousHash = History.getInstance().getPreviousHash();

		if (sPreviousHash !== undefined) {
			// eslint-disable-next-line
			history.go(-1);
		} else {
			this.getRouter().navTo("master", {},{}, true);
		}
	}

	public getUniqueMessages (messages: any) {
		return messages.reduce((acc: any, msg: any) => {
			const targets = msg.getTargets?.(); // or msg.getTarget() if it's single target
			if (!targets || targets.length === 0) return acc;
		
			const isAlreadyIncluded = acc.some((existingMsg: any) => {
				const existingTargets = existingMsg.getTargets?.();
				return existingTargets?.some(t => targets.includes(t));
			});
		
			if (!isAlreadyIncluded) {
				acc.push(msg);
			}
		
			return acc;
		}, []);
	} 

	public setMessageSection (context: Context, sectionName: string): void {
		const messages = this.getModel().getMessages(context);
		const uniqueMessages = this.getUniqueMessages(messages);
		this.getModel("messages").setProperty(`/${sectionName}`, uniqueMessages);
	}

	public onMessagePopoverPress (event: Event, sectionName: string) {
		const sourceControl = (event.getSource() as any);
		const popover = this.createMessagePopover(sectionName);
		const messagesModel = this.getModel("messages");
		popover.setModel(messagesModel, "messages");
		popover.openBy(sourceControl);
	}

	public createMessagePopover(sectionName: string): MessagePopover {
		return new MessagePopover({
			items: {
				path: `messages>/${sectionName}`,
				template: new MessageItem({
					type: "{messages>type}",
					title: "{messages>message}",
					subtitle: "{messages>additionalText}",
					description: "{messages>description}"
				})
			}
		})
	}

	// TODO: Check what is the best way to reset error messages from the model
	public removeMessageFromMessageManager (sectionName: string) {
		this.getModel()?.setMessages({});
		this.getModel("messages").setProperty(`/${sectionName}`, []);
	}

	public getUIModel (): JSONModel {
        return this.getModel("ui") as JSONModel;
    }

	public subscribeEventEmitter (channelId: string, eventId: string, cb: any) {
		this.getOwnerComponent()?.getEventBus().subscribe(channelId, eventId, cb, this);
	}

	public publishEventEmitter (channelId: string, eventId: string) {
		this.getOwnerComponent()?.getEventBus().publish(channelId, eventId);
	}
}