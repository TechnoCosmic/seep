import * as vscode from 'vscode';
import * as common from './common';


class CommandSequence {
    label: string = '';
    commands: string[] = [];
    curIndex: number = -1;
};


let commands: CommandSequence[] = [];
let curSequence: number = -1;


function runSequence() {
    if (curSequence == -1) return;

    let curSeqObj: CommandSequence = commands[curSequence];

    ++curSeqObj.curIndex;

    if (curSeqObj.curIndex >= curSeqObj.commands.length) {
        curSeqObj.curIndex = -1;
        curSequence = -1;
        return;
    }

    vscode.commands.executeCommand(curSeqObj.commands[curSeqObj.curIndex]).then(runSequence);
}


function addCmdRunSequence(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('seep.runSequence', () => {
        commands = common.getSetting<CommandSequence[]>('sequences', []);

        for (let cmd of commands) {
            cmd.curIndex = -1;
        }

        vscode.window.showQuickPick(commands).then((selectedOption) => {
            if (!selectedOption) return;
            curSequence = commands.indexOf(selectedOption);
            runSequence();
        });
    });

    context.subscriptions.push(cmd);
}


export function connect(context: vscode.ExtensionContext) {
    addCmdRunSequence(context);
}
