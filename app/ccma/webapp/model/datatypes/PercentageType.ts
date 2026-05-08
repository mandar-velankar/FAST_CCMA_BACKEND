import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

/**
 * @namespace com.bayer.tender.ccma.model.datatypes
 */
export default class PercentageType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(parts: any[]): string {
        if (!parts) {
            return "";
        }
        
        const value = parts[0] ?? 0;
        const minFractionDigits = parts[1] ?? 2;
        const maxFractionDigits = parts[2] ?? 2;
        
        const oPercentFormat = NumberFormat.getPercentInstance({
            minFractionDigits: minFractionDigits,
            maxFractionDigits: maxFractionDigits
        });
        
        return oPercentFormat.format(Number(value));
    }

    parseValue(oValue: string): number {
        const floatNum = parseFloat(oValue.replace(",", "."));
        return floatNum / 100;
    }

    validateValue(oValue: number): void {
        if (oValue > 1) {
            throw new ValidateException("Not a valid percentage!");
        }
    }

    /**
     * Override
     * see https://sapui5.netweaver.ondemand.com/sdk/#/api/sap.ui.model.SimpleType%23methods/Summary
     */
    getModelFormat() {
        return {
            format: (value: any) => this.formatValue(value),
            parse: (value: any) => this.parseValue(value)
        };
    }
}
