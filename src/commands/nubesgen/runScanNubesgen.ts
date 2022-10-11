import * as vscode from 'vscode';
import { getExtensionPath, longRunning } from '../../utils/host';
import { failed } from '../../utils/errorable';
import { createWebView } from '../../utils/webview';
import { createNubegenWebView, downloadNubesgenBinary, runNubesgenCommand } from './helper/nubegenHelper';
import { buildNubegenScanCommand } from './helper/nubegenCommandBuilder';
import { reporter } from '../../utils/reporter';
import { InstallationResponse } from '../../utils/models/installationResponse';

export default async function runScanNubesgen(
    _context: vscode.ExtensionContext,
    destination: string
): Promise<void> {

    const extensionPath = getExtensionPath();
    if (failed(extensionPath)) {
        vscode.window.showErrorMessage(extensionPath.error);
        return undefined;
    }

    // Download Binary first
    const downladResult = await longRunning(`Downloading Nubegen.`, () => downloadNubesgenBinary());
    if (!downladResult) {
        return undefined;
    }

    const result = await longRunning(`Running Nubesgen.`, () => runNubesgenCommand(buildNubegenScanCommand()));
    const createResponse: InstallationResponse = { name:"Nubegen Run", stdout: result[0], stderr: result[1] };


    if (reporter) {
        reporter.sendTelemetryEvent("nubegenCommand", { nubegenCommand: "command ran sucessfully" });
    }
    if (result) {
        const webview = createWebView('AKS DevX Tool', `Nubegen Genegrate files.`);
        createNubegenWebView('nubesgen', webview, extensionPath.result, createResponse);
    }
}
