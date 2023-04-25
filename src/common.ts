import * as vscode from 'vscode';


export function getEndOfLineString(eol: vscode.EndOfLine): string {
    switch (eol) {
        case vscode.EndOfLine.CRLF: return '\r\n';
        case vscode.EndOfLine.LF: return '\n';
        default: return '';
    }
}


export function cleanClip(str: string, eol: string) {
    return removeCommonLeadingWhitespace(trimBlankLines(str, eol));
}


export function surround(heading: string, trailing: string, isSnippet: boolean): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { document } = editor;
    if (!document) return;

    const selRange = new vscode.Range(editor.selection.start, editor.selection.end);
    if (!selRange) return;

    const eolStr: string = getEndOfLineString(document.eol);
    const cleanedClip = cleanClip(document.getText(selRange), eolStr);
    const selLines: string[] = cleanedClip.lines;
    const leadingWhite: string = ' '.repeat(cleanedClip.leadingWhite);
    let indent: string = '';

    if (editor.options.insertSpaces) {
        const charCount = editor.options.tabSize || 4;
        indent = ' '.repeat(charCount as number);
    }

    const selStr: string = selLines.join(eolStr + indent + leadingWhite);
    const snipStop: string = (isSnippet ? '$0' : '');

    const finalStr: string =
        leadingWhite + heading + eolStr +
        indent + leadingWhite + snipStop + selStr + eolStr +
        leadingWhite + trailing + eolStr;

    editor.edit(editBuilder => {
        editBuilder.delete(selRange);

        if (!isSnippet) {
            editBuilder.insert(selRange.start, finalStr);
        }
    }).then(() => {
        if (isSnippet) {
            const snippetFinal = new vscode.SnippetString(finalStr);
            editor.insertSnippet(snippetFinal, selRange.start);
        }
    });

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
