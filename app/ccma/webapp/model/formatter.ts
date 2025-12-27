import NumberFormat from "sap/ui/core/format/NumberFormat";
import DateFormat from "sap/ui/core/format/DateFormat";

const floatInstance = NumberFormat.getFloatInstance({
    maxFractionDigits: 2
});

const currencyInstance = NumberFormat.getCurrencyInstance({
    minFractionDigits: 2,
    maxFractionDigits: 2
});

export function currencyValue(sValue: string, currency: string): string {
    if (!sValue) {
        return "";
    }
    return parseFloat(sValue).toFixed(2) + " " + currency;
}

export function formatPercentage(value: number): string | undefined {
    if (!value) return;
    const oPercentFormat = NumberFormat.getPercentInstance({
        minFractionDigits: 2,
        maxFractionDigits: 2
    });
    return oPercentFormat.format(value);
}

export function formatFloat(value: number): string | undefined {
    if (!value) return;
    return floatInstance.format(value);
}

export function parseFloatValue(value: string): number | undefined {
    if (!value) return;
    const parsed = floatInstance.parse(value);
    return typeof parsed === 'number' ? parsed : undefined;
}

export function formatCurrency(value: string | number, currency: string, region: string): string {
    if (!value && value != 0) return "";
    const numberFormat = NumberFormat.getFloatInstance({
        maxFractionDigits: region === 'MEA' ? 3 : 2,
        minFractionDigits: region === 'MEA' ? 3 : 2,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
    });
    const roundedValue = parseFloat(value as string);
    return numberFormat.format(roundedValue) + " " + currency;
}

export function parseCurrency(value: string): number | undefined {
    if (!value) return;
    const parsed = currencyInstance.parse(value);
    return typeof parsed === 'number' ? parsed : undefined;
}

export function formatDate(date: string | Date, pattern: string): string {
    let jsDate: Date;
    if (typeof date === "string") {
        jsDate = new Date(date);
        if (isNaN(jsDate.getTime())) return "";
    } else {
        jsDate = date;
    }
    return DateFormat.getDateInstance({ pattern: pattern, UTC: true }).format(jsDate);
}

export function parseDate(date: string, pattern: string): Date | null {
    const parsed = DateFormat.getDateInstance({ pattern: pattern, UTC: true }).parse(date);
    if (parsed instanceof Date) return parsed;
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0] instanceof Date) return parsed[0];
    return null;
}

export function formatText(value: string): number {
    return parseInt(value);
}

export function toUpperCamelCase(str: string): string {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function replaceString(originalString: string): string {
    let stringToReplace, replacementString;
    switch (originalString.toLocaleLowerCase()) {
        case 'pricewithfoc':
            stringToReplace = originalString;
            replacementString = "Price with FOC";
            break;
        case 'discountwithfoc':
            stringToReplace = originalString;
            replacementString = "Discount with FOC";
            break;
        case 'taiwancontractprice':
            stringToReplace = originalString;
            replacementString = "Taiwan Contract Price";
            break;
        case 'taiwandiscount':
            stringToReplace = originalString;
            replacementString = "Taiwan Discount";
            break;
        case 'nldiscount':
            stringToReplace = originalString;
            replacementString = "NL Discount";
            break;
        case 'nlprice':
            stringToReplace = originalString;
            replacementString = "NL Price";
            break;
        case 'specialprice':
            stringToReplace = originalString;
            replacementString = "Special";
            break;
        case 'withmaximumprice':
            stringToReplace = originalString;
            replacementString = "With Maximum Price";
            break;
        case 'precioneto':
            stringToReplace = originalString;
            replacementString = "Precio Neto";
            break;
        case 'descuentocomercial':
            stringToReplace = originalString;
            replacementString = "Descuento Comercial";
            break;
        case 'descuentoespecial':
            stringToReplace = originalString;
            replacementString = "Descuento Especial";
            break;
        default:
            return originalString;
    }
    const regex = new RegExp(stringToReplace, 'gi');
    return originalString.replace(regex, replacementString);
}

export function truncToTwoDecimalPlaces(number: number): number {
    const factor = 100;
    return Math.round(number * factor) / factor;
}

export function truncToThreeDecimalPlaces(number: number): number {
    const factor = 1000;
    return Math.round(number * factor) / factor;
}

export function truncToFourDecimalPlaces(number: number): number {
    const factor = 10000;
    return Math.round(number * factor) / factor;
}

export function roundToSixDecimalPlaces(number: number): number {
    const factor = 1000000;
    return Math.round(number * factor) / factor;
}

export function formatRequestedQuantity(value: number, uom: string): string | undefined {
    if (!value && value != 0) return;
    const numberFormat = NumberFormat.getIntegerInstance({
        maxFractionDigits: 0,
        minFractionDigits: 0,
        groupingEnabled: true,
        groupingSeparator: ','
    });
    return `${numberFormat.format(value)} ${uom}`;
}

export function formatBonus(bonus: string): string {
    if (!bonus) {
        return "";
    }
    const oNumberFormat = NumberFormat.getFloatInstance({
        maxFractionDigits: 0,
        minFractionDigits: 0,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
    });
    if (bonus.includes("%")) {
        const value = parseFloat(bonus.replace("%", ""));
        return oNumberFormat.format(value) + "%";
    } else {
        const [numberPart, unitPart] = bonus.split(" ");
        const formattedNumber = oNumberFormat.format(parseFloat(numberPart));
        return unitPart ? formattedNumber + " " + unitPart : formattedNumber;
    }
}

export function formatInternalBidDueDateDatePickerMinDate(today: string, OfferDueDate: string): string {
    if (today >= OfferDueDate) {
        return OfferDueDate;
    } else {
        return today;
    }
}

export function outcome(grossMargin: number): boolean | undefined {
    if (!grossMargin) { return; }
    const newGrossMargin = grossMargin * 100;
    if (parseFloat(newGrossMargin as any) >= parseFloat('40%')) {
        return true;
    } else {
        return false;
    }
}

export function formatESProductOutcomeIcon(grossMargin: number): string {
    const result = outcome(grossMargin);
    return result ? "sap-icon://sys-enter-2" : "sap-icon://error";
}

export function formatESProductOutcomeState(grossMargin: number): string {
    const result = outcome(grossMargin);
    return result ? "Success" : "Error";
}

export function priceTwoOrFour(price: string, currency: string, unit: string): string {
    if (!price) {
        return "";
    }
    const oNumberFormat = NumberFormat.getFloatInstance({
        maxFractionDigits: unit !== "Pack" ? 4 : 2,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
    });
    const oValue = oNumberFormat.format(parseFloat(price));
    if (!currency) {
        return oValue;
    }
    return oValue + " " + currency;
}

export function statusPrice(isLowest: number): string {
    try {
        if (isLowest === 1) {
            return "Error";
        }
        return "None";
    } catch (err) {
        return "None";
    }
}

export function hasAdditionalCondition(sorter: string, additionalConditions: any[]): string {
    if (!sorter || !additionalConditions) return 'No';
    return additionalConditions.some(cond => cond.SORTER === sorter) ? 'Yes' : 'No';
}

export function price(price: string, currency: string): string {
    if (!price) {
        return "";
    }
    const oNumberFormat = NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
    });
    const oValue = oNumberFormat.format(parseFloat(price));
    if (currency === undefined) {
        return oValue;
    }
    return oValue + " " + currency;
}

export function getLiquidationInMonths (liquidation: string){
    switch (liquidation) {
        case "Monthly": return 1;
        case "Quarterly": return 3;
        case "HalfYearly": return 6;
        case "Annually": return 12;
        default:return 0;
    }
}

export function formatHighlight(hasActiveContracts: string) {
    if (hasActiveContracts === "Yes") {
        // FORCE reset
        return "None"; 
    }

    return "Warning";
}