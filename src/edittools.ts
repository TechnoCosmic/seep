import * as vscode from 'vscode';
import * as common from './common';


function getFirstRulerPosition(): number {
    const config = vscode.workspace.getConfiguration('editor');
    const rulerPositions: number[] = config.get<number[]>('rulers', []);

    return Math.min(...rulerPositions);
}

const keywords: string[] = [
];


export class KeywordInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        let suggestions: vscode.InlineCompletionItem[] = [];

        const editor = vscode.window.activeTextEditor;
        if (!editor) return suggestions;

        const word = document.getText(document.getWordRangeAtPosition(editor.selection.active));

        if (word.length >= 2) {
            const keywords: string[] = common.getSetting<string[]>('keywords', []);

            for (const keyw of keywords) {
                const pref: string = keyw.substring(0, word.length);

                if (word.startsWith(pref)) {
                    const thingy = new vscode.InlineCompletionItem(keyw.substring(word.length));
                    thingy.range = new vscode.Range(position.line, position.character, position.line, position.character);
                    suggestions.push(thingy);
                }
            }
        }

        return suggestions;
    }
}

export class HistoryInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        let suggestions: vscode.InlineCompletionItem[] = [];

        const lineTextOrig = document.lineAt(position.line).text;
        const lineText = lineTextOrig.substring(0, position.character).trimStart();
        const isAtEol = position.character === lineTextOrig.length;

        const rulerPosn: number = getFirstRulerPosition();
        if (rulerPosn === 0) return suggestions;

        if (!isAtEol) return suggestions;
        if (!lineText.startsWith("// ")) return suggestions;

        const indent: number = common.getCurrentLineIndentation().length;
        const str: string = "// " + '*'.repeat(rulerPosn - indent - 3);

        const suggestion = new vscode.InlineCompletionItem(str);
        suggestion.range = new vscode.Range(position.line, indent, position.line, position.character);
        suggestions.push(suggestion);

        return suggestions;
    }
}


function addCmdClearLine(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.clearLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const { document } = editor;
        if (!document) return;

        const line: vscode.TextLine = document.lineAt(editor.selection.start.line);
        const lineStr: string = document.getText(line.range);
        const caps = lineStr.match(/^\s*/);
        if (!caps) return;

        const leadingWhitespace = caps[0].length;
        const cursorPosition = editor.selection.active;
        const endOfLine: vscode.Position = document.lineAt(cursorPosition.line).range.end;

        const rangeToDelete = new vscode.Range(
            cursorPosition.with(undefined, leadingWhitespace),
            endOfLine
        );

        editor.edit(editBuilder => {
            editBuilder.delete(rangeToDelete);
        }).then(() => {
            vscode.commands.executeCommand('cursorEnd');
        });
    });

    context.subscriptions.push(cmd);
}


function addSectionBreakSuggestor(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file', language: '*' }, new HistoryInlineCompletionProvider()
    ));

    context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file', language: '*' }, new KeywordInlineCompletionProvider()
    ));
}


export function connect(context: vscode.ExtensionContext) {
    addCmdClearLine(context);
    addSectionBreakSuggestor(context);
}
