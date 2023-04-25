import * as vscode from 'vscode';
import * as common from './common';


class RefactorOptionItem implements vscode.QuickPickItem {
    id: string = '';
    label: string = '';
    detail: string = '';
    description?: string;
    func: any;
};


let refactorOptions: RefactorOptionItem[] = [];


// *********************************************************************************************************************
// Indexed For Loop
// *********************************************************************************************************************

const iforStr: string = 'for ( int ${1:var} = 0; ${1:var} < ${2:limit}; ++${1:var} ) {';


function refactorToIndexedForLoop(): void {
    common.surround(iforStr, "}", true);
}


function addCmdRefactorIFor(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.refactorToIndexedForLoop', () => {
        refactorToIndexedForLoop();
    });

    context.subscriptions.push(cmd);

    refactorOptions.push({
        id: 'ifor', label: 'For loop (indexed)', detail: 'Surrounds the selected code in an indexed for loop', func: () => {
            refactorToIndexedForLoop();
        }
    });
}


// *********************************************************************************************************************
// Ranged For Loop
// *********************************************************************************************************************

const rforStr: string = 'for ( auto ${1:var} : ${2:container} ) {';


function refactorToRangedForLoop(): void {
    common.surround(rforStr, "}", true);
}


function addCmdRefactorRFor(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.refactorToRangedForLoop', () => {
        refactorToRangedForLoop();
    });

    context.subscriptions.push(cmd);

    refactorOptions.push({
        id: 'rfor', label: 'For loop (ranged)', detail: 'Surrounds the selected code in a ranged for loop', func: () => {
            refactorToRangedForLoop();
        }
    });
}


// *********************************************************************************************************************
// While Loop
// *********************************************************************************************************************

const whileStr: string = 'while ( ${1:true} ) {';


function refactorToWhileLoop(): void {
    common.surround(whileStr, "}", true);
}


function addCmdRefactorWhile(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.refactorToWhileLoop', () => {
        refactorToWhileLoop();
    });

    context.subscriptions.push(cmd);

    refactorOptions.push({
        id: 'whle', label: 'While loop', detail: 'Surrounds the selected code in a while loop', func: () => {
            refactorToWhileLoop();
        }
    });
}


// *********************************************************************************************************************
// Lambda
// *********************************************************************************************************************

const lambdaStr: string = 'const auto ${1:lambda} { [ ${2:captures} ]( ${3:params} ) {';


function refactorToLambda(): void {
    common.surround(lambdaStr, "} };", true);
}


function addCmdRefactorLambda(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.refactorToLambda', () => {
        refactorToLambda();
    });

    context.subscriptions.push(cmd);

    refactorOptions.push({
        id: 'lamb', label: 'Local lambda', detail: 'Surrounds the selected code in a lambda wrapper', func: () => {
            refactorToLambda();
        }
    });
}


// *********************************************************************************************************************
// Other
// *********************************************************************************************************************

function addCmdRefactor(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.showRefactorList', () => {
        vscode.window.showQuickPick(refactorOptions).then((selectedOption) => {
            if (!selectedOption) return;
            selectedOption.func();
        });
    });

    context.subscriptions.push(cmd);
}


export function connect(context: vscode.ExtensionContext) {
    addCmdRefactor(context);
    addCmdRefactorIFor(context);
    addCmdRefactorRFor(context);
    addCmdRefactorWhile(context);
    addCmdRefactorLambda(context);
}
