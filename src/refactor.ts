import * as vscode from 'vscode';


const iforStr: string = 'for ( int ${1:var} = 0; ${1:var} < ${2:limit}; ++${1:var} ) {';
const rforStr: string = 'for ( auto ${1:var} : ${2:container} ) {';
const whileStr: string = 'while ( ${1:true} ) {';
const lambdaStr: string = 'const auto ${1:lambda} { [${2:captures}]( ${3:params} ) {';


class RefactorOptionItem implements vscode.QuickPickItem {
    id: string = '';
    label: string = '';
    detail: string = '';
    description?: string;
    func: any;
};


let refactorOptions: RefactorOptionItem[] = [
    {
        id: 'ifor', label: 'For loop (indexed)', detail: 'Surrounds the selected code in an indexed for loop', func: () => {
            surround(iforStr, "}", true);
        }
    },

    {
        id: 'rfor', label: 'For loop (ranged)', detail: 'Surrounds the selected code in a ranged for loop', func: () => {
            surround(rforStr, "}", true);
        }
    },

    {
        id: 'whle', label: 'While loop', detail: 'Surrounds the selected code in a while loop', func: () => {
            surround(whileStr, "}", true);
        }
    },

    {
        id: 'lamb', label: 'Local lambda', detail: 'Surrounds the selected code in a lambda wrapper', func: () => {
            surround(lambdaStr, "} };", true);
        }
    },
];


function getEndOfLineString(eol: vscode.EndOfLine): string {
    switch (eol) {
        case vscode.EndOfLine.CRLF: return '\r\n';
        case vscode.EndOfLine.LF: return '\n';
        default: return '';
    }
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


function cleanClip(str: string, eol: string) {
    return removeCommonLeadingWhitespace(trimBlankLines(str, eol));
}


function surround(heading: string, trailing: string, isSnippet: boolean): void {
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


function addCmdRefactor(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.refactor', () => {
        vscode.window.showQuickPick(refactorOptions).then((selectedOption) => {
            if (!selectedOption) return;
            selectedOption.func();
        });
    });

    context.subscriptions.push(cmd);
}


export function connect(context: vscode.ExtensionContext) {
    addCmdRefactor(context);
}
