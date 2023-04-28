import * as vscode from 'vscode';
import * as edit from './edittools';
import * as refactor from './refactor';
import * as cmdseq from './cmdseq';


export function activate(context: vscode.ExtensionContext) {
    edit.connect(context);
    refactor.connect(context);
    cmdseq.connect(context);
}


export function deactivate() { }
