import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

/**
 * @namespace com.bayer.tender.ccma.model.datatypes
 */
export default class CustomNumberType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(parts: any[]): string {
        if (!parts) {
            return "";
        }
        const countryGroupingSeparators: Record<string, string> = {
            'PL': ' '
        };
        const oCurrencyFormat = NumberFormat.getIntegerInstance({
            maxFractionDigits: 0,
            minFractionDigits: 0,
            groupingEnabled: true,
            groupingSeparator: countryGroupingSeparators[parts[1]] ? countryGroupingSeparators[parts[1]] : ","
        });
        return parts[2] === 'MEA' || (parts[2] !== 'MEA' && parts[1]?.toLowerCase()?.includes('hm')) || parts[1] === 'PL'
            ? oCurrencyFormat.format(Number(parts[0] ?? 0))
            : parts[0];
    }

    parseValue(number: any): any[] {
        return [number];
    }

    validateValue(number: any): void {
        // if(!(/^[+]?\d+$/).test(number)) {
        //     throw new ValidateException("Not a valid number");
        // }
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
