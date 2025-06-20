import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

export default class CustomPercentageType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(parts: any[]): string {
        if (!parts) {
            return "";
        }
        const oPercentFormat = NumberFormat.getPercentInstance({
            minFractionDigits: parts[1] === 'AU' ? 4 : 2,
            maxFractionDigits: parts[2] === 'AU' ? 4 : 2,
            groupingEnabled: true,
            groupingSeparator: ",",
            decimalSeparator: ".",
            preserveDecimals: parts[1] === 'AU' ? true : false
        });
        return oPercentFormat.format(Number(parts[0] ?? 0));
    }

    parseValue(oValue: string): number[] {
        let floatNum = parseFloat(oValue);
        return [floatNum / 100];
    }

    validateValue(aValues: any[]): void {
        const value = Array.isArray(aValues) ? aValues[0] : aValues;
        if (value > 1) {
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
