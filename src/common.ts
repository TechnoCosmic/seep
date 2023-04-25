import * as vscode from 'vscode';


export function getSetting<T>(str: string, def: T): T {
    const config = vscode.workspace.getConfiguration('seep');
    return config.get<T>(str, def);
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


export function replaceWithSnippet(snippet: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { document } = editor;
    if (!document) return;

    const selRange = new vscode.Range(editor.selection.start, editor.selection.end);
    if (!selRange) return;

    const eolStr: string = getEndOfLineString(document.eol);
    const cleanedClip = cleanString(document.getText(selRange), eolStr);
    const leadingWhite: string = ' '.repeat(cleanedClip.leadingWhite);

    const cleanedSnippet = cleanString(snippet, eolStr);
    const indentedSnippet = leadingWhite + cleanedSnippet.lines.join(eolStr + leadingWhite) + eolStr;
    const snippetObj = new vscode.SnippetString(indentedSnippet);

    editor.insertSnippet(snippetObj, selRange);
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
