import * as vscode from 'vscode';
import * as common from './common';


class RefactorOptionItem implements vscode.QuickPickItem {
    label: string = '';
    detail: string = '';
    description?: string;
    snippet: string = '';
};


async function makeLocal() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { document } = editor;
    if (!document) return;

    const sel = editor.selection;
    if (!sel) return;
    if (sel.isEmpty) return;

    const varNameStr: string = await vscode.window.showInputBox({
        prompt: "Name",
        value: ''
    }) || "";

    if (varNameStr.trim().length === 0) return;

    const contentStr: string = document.getText(sel);
    const currentLine = editor.document.lineAt(sel.start.line);
    const desiredPosition = currentLine.range.start;

    const line: vscode.TextLine = document.lineAt(editor.selection.start.line);
    const lineStr: string = document.getText(line.range);
    const caps = lineStr.match(/^\s*/);
    if (!caps) return;

    const leadingWhitespace = caps[0].length;

    editor.edit(editBuilder => {
        editBuilder.replace(sel, varNameStr);
        editBuilder.insert(desiredPosition, ' '.repeat(leadingWhitespace) + 'const auto ' + varNameStr + '{ ' + contentStr + ' };\r\n');
    }).then(() => {
    });

}


// *********************************************************************************************************************
// Other
// *********************************************************************************************************************


function changeFromHex(inputString: string, toBase: number, digits: number): string {
    return changeBase(inputString, /\b0x[0-9A-Fa-f]+\b/g, 16, toBase, digits);
}


function changeFromDecimal(inputString: string, toBase: number, digits: number): string {
    return changeBase(inputString, /\b\d+\b/g, 10, toBase, digits);
}


function changeFromBinary(inputString: string, toBase: number, digits: number): string {
    return changeBase(inputString, /\b0b[01]+\b/g, 2, toBase, digits);
}


function getLargestNumber(inputString: string, regex: any, fromBase: number): number {
    let maxNumber = 0;
    let match;

    while ((match = regex.exec(inputString)) !== null) {
        let inputValue: string = match[0] || '';

        if (inputValue.startsWith('0x')) inputValue = inputValue.substring(2);
        if (inputValue.startsWith('0b')) inputValue = inputValue.substring(2);

        const decimalValue = parseInt(inputValue, fromBase);

        if (decimalValue > maxNumber) {
            maxNumber = decimalValue;
        }
    }

    return maxNumber;
}


function changeBase(inputString: string, regex: any, fromBase: number, toBase: number, digits: number): string {
    const convertedString: string = inputString.replace(regex, (match) => {
        if (match.startsWith('0x')) match = match.substring(2);
        if (match.startsWith('0b')) match = match.substring(2);

        const decimalValue = parseInt(match, fromBase);
        const convertedValue = decimalValue.toString(toBase);

        let prefix: string = "";
        if (toBase === 2) prefix = "0b";
        if (toBase === 8) prefix = "0";
        if (toBase === 16) prefix = "0x";

        const padChar: string = toBase === 10 ? '' : '0';
        return prefix + convertedValue.padStart(digits, padChar).toUpperCase();
    });

    return convertedString;
}


function getMinimumBytes(num: number): number {
    if (num >= 0 && num <= 255) return 1;
    if (num >= 0 && num <= 65535) return 2;
    if (num >= 0 && num <= (2 ^ 32) - 1) return 4;
    return 8;
}


function selectionToBase(convFunc1: any, convFunc2: any, toBase: number) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { document } = editor;
    if (!document) return;

    const selStr: string = document.getText(editor.selection);

    const largestHexNumber: number = getLargestNumber(selStr, /\b0x[0-9A-Fa-f]+\b/g, 16);
    const largestDecNumber: number = getLargestNumber(selStr, /\b\d+\b/g, 10);
    const largestBinNumber: number = getLargestNumber(selStr, /\b0b[01]+\b/g, 2);
    const largestNumber: number = Math.max(largestHexNumber, largestDecNumber, largestBinNumber);
    const byteCount: number = getMinimumBytes(largestNumber);
    const digits: number = Math.ceil(byteCount * 8 / Math.log2(toBase));
    const outStr: string = convFunc1(convFunc2(selStr, toBase, digits), toBase, digits);

    editor.edit(editBuilder => {
        editBuilder.replace(editor.selection, outStr);
    });
}



function addCmdChangeBase(context: vscode.ExtensionContext) {
    let toHex = vscode.commands.registerCommand('seep.toHex', () => {
        selectionToBase(changeFromBinary, changeFromDecimal, 16);
    });
    context.subscriptions.push(toHex);

    let toDecimal = vscode.commands.registerCommand('seep.toDec', () => {
        selectionToBase(changeFromBinary, changeFromHex, 10);
    });
    context.subscriptions.push(toDecimal);

    let toBinary = vscode.commands.registerCommand('seep.toBin', () => {
        selectionToBase(changeFromDecimal, changeFromHex, 2);
    });
    context.subscriptions.push(toBinary);
}


function addCmdMakeLocal(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.makeLocal', makeLocal);
    context.subscriptions.push(cmd);
}


function addCmdRefactor(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.showRefactorList', () => {
        const snippets = common.getSetting<RefactorOptionItem[]>('snippets', []);

        vscode.window.showQuickPick(snippets).then((selectedOption) => {
            if (!selectedOption) return;
            common.replaceWithSnippet(selectedOption.snippet);
        });
    });

    context.subscriptions.push(cmd);
}


export function connect(context: vscode.ExtensionContext) {
    addCmdRefactor(context);
    addCmdMakeLocal(context);
    addCmdChangeBase(context);
}
