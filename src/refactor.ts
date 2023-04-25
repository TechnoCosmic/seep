import * as vscode from 'vscode';
import * as common from './common';


class RefactorOptionItem implements vscode.QuickPickItem {
    label: string = '';
    detail: string = '';
    description?: string;
    snippet: string = '';
};


// *********************************************************************************************************************
// Other
// *********************************************************************************************************************

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
}
