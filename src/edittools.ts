import * as vscode from 'vscode';


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


export function connect(context: vscode.ExtensionContext) {
    addCmdClearLine(context);
}
