import * as vscode from 'vscode';
import * as edit from './edittools';
import * as refactor from './refactor';


export function activate(context: vscode.ExtensionContext) {
    edit.connect(context);
    refactor.connect(context);
}


export function deactivate() { }
