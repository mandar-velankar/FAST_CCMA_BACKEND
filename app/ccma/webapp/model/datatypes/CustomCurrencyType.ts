import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

export default class CustomCurrencyType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(parts: any[]): string {
        if (!parts) {
            return "";
        }

        const minFractionDigits = parts[3] === 'ES' ? 6 : 2;
        const maxFractionDigits = minFractionDigits;

        const oCurrencyFormat = NumberFormat.getCurrencyInstance({
            minFractionDigits,
            maxFractionDigits,
            groupingEnabled: true,
            groupingSeparator: ",",
            decimalSeparator: "."
        });

        const raw = parts[0] ?? "0";
        const cleaned = typeof raw === 'string' ? raw.replace(/,/g, '') : raw;
        const num = typeof cleaned === 'string' ? Number(cleaned) : cleaned;

        if (isNaN(num)) {
            console.warn("NaN encountered:", raw, cleaned, parts);
            return `${parts[1] ?? ''}`;
        }

        return `${oCurrencyFormat.format(num)} ${parts[1] ?? ''}`;
    }

    parseValue(oValue: any): any {
        const oCurrencyFormat = NumberFormat.getCurrencyInstance({
        });
        return oCurrencyFormat.parse(oValue);
    }

    validateValue(oValue: any): void {
        // if(oValue > 1) {
        //     throw new ValidateException("Not a valid Currency!");
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
