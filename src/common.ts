import * as vscode from 'vscode';


export function getSetting<T>(str: string, def: T): T {
    const config = vscode.workspace.getConfiguration('seep');
    return config.get<T>(str, def);
}


export function getCurrentLineIndentation(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return "";

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line);
    const leadingWhitespace = line.text.match(/^\s*/);

    return leadingWhitespace ? leadingWhitespace[0] : "";
}


export function getEndOfLineString(eol: vscode.EndOfLine): string {
    switch (eol) {
        case vscode.EndOfLine.CRLF: return '\r\n';
        case vscode.EndOfLine.LF: return '\n';
        default: return '';
    }
}


export function cleanString(str: string, eol: string) {
    return removeCommonLeadingWhitespace(trimBlankLines(str, eol));
}


function insertSnippetText(str: string, range: vscode.Range): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const snippetObj = new vscode.SnippetString(str);
    editor.insertSnippet(snippetObj, range);
}


export function replaceWithSnippet(snippet: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { document } = editor;
    if (!document) return;

    const eolStr: string = getEndOfLineString(document.eol);

    const selRange = new vscode.Range(editor.selection.start, editor.selection.end);
    if (!selRange) return;

    let indent: string = '';

    if (editor.options.insertSpaces) {
        indent = ' '.repeat((editor.options.tabSize || 4) as number);
    }

    const cleanedSelected = cleanString(document.getText(selRange), eolStr);
    const leadingWhite: string = ' '.repeat(cleanedSelected.leadingWhite);
    const indentedSelectedStr = indent + cleanedSelected.lines.join(eolStr + indent);

    const regex = /\$\{TM_SELECTED_TEXT\}(?!\d)/g;
    const replacedSnippet = snippet.replace(regex, indentedSelectedStr);
    const cleanedSnippet = cleanString(replacedSnippet, eolStr);
    const cleanedSnippetStr: string = leadingWhite + cleanedSnippet.lines.join(eolStr + leadingWhite) + eolStr;

    insertSnippetText(cleanedSnippetStr, selRange);
}


function trimBlankLines(str: string, eol: string): string[] {
    const lines = str.split(eol);
    let startIdx = 0;
    let endIdx = lines.length - 1;

    while (startIdx < lines.length && lines[startIdx].trim() === "") {
        ++startIdx;
    }

    while (endIdx >= 0 && lines[endIdx].trim() === "") {
        --endIdx;
    }

    return lines.slice(startIdx, endIdx + 1);
}


function removeCommonLeadingWhitespace(lines: string[]) {
    if (lines.length === 0) return { lines: lines, leadingWhite: 0 };

    let minLeadingWhitespace = Infinity;

    for (let line of lines) {
        if (line.trim().length === 0) continue;

        const caps = line.match(/^\s*/);

        if (caps) {
            minLeadingWhitespace = Math.min(minLeadingWhitespace, caps[0].length);
        }
    }

    if (minLeadingWhitespace === 0) return { lines: lines, leadingWhite: 0 };

    for (let i = 0; i < lines.length; ++i) {
        lines[i] = lines[i].slice(minLeadingWhitespace);
    }

    return { lines: lines, leadingWhite: minLeadingWhitespace };
}
