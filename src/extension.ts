import * as vscode from 'vscode';
import { formatTime } from './time';
import { ConnectivityMonitor } from './connectivity';
import { getConfigMarkdown, toggleSetting, toggleCustomFormat, openQuickMenu } from './settings';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
const connectivityMonitor = new ConnectivityMonitor();

function updateTime() {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('datetime.enable', true);
	const showDate = config.get<boolean>('datetime.showDate', false);
	const militaryTime = config.get<boolean>('datetime.militaryTime', false);
	const customFormat = config.get<string>('datetime.customTimeFormat', '');
	const showInternetConnectionStatus = config.get<boolean>('datetime.showInternetConnectionStatus', false);

	if (!enabled) {
		myStatusBarItem.hide();
		return;
	}
	const connectivity = showInternetConnectionStatus ? (connectivityMonitor.isConnected() ? ' $(globe)' : ' $(circle-slash)') : '';
	const date = showDate ? ` ${new Date().toLocaleDateString()}` : '';
	const time = formatTime(customFormat, militaryTime);
	myStatusBarItem.text = `$(watch) ${time}${date}${connectivity}`;
	const tooltip = new vscode.MarkdownString(getConfigMarkdown());
	tooltip.isTrusted = true; // allow command: links
	tooltip.supportThemeIcons = true;
	myStatusBarItem.tooltip = tooltip;
	myStatusBarItem.command = 'datetime.openMenu';
	myStatusBarItem.show();
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Start monitoring internet connection
	connectivityMonitor.start(() => {
		// Callback on status change: update status bar
		updateTime();
	});

	updateTime();
	const intervalId = setInterval(updateTime, 1000);

	context.subscriptions.push(
		new vscode.Disposable(() => clearInterval(intervalId)),
		new vscode.Disposable(() => connectivityMonitor.stop())
	);

	// Optionally, update the status bar if configuration changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (
				e.affectsConfiguration('datetime.enable') ||
				e.affectsConfiguration('datetime.showDate') ||
				e.affectsConfiguration('datetime.militaryTime') ||
				e.affectsConfiguration('datetime.customTimeFormat') ||
				e.affectsConfiguration('datetime.showInternetConnectionStatus')
			) {
				updateTime();
			}
		})
	);

	// Commands used by tooltip links and click action
	context.subscriptions.push(
		vscode.commands.registerCommand('datetime.toggleEnable', async () => {
			await toggleSetting('datetime.enable');
			updateTime();
		}),
		vscode.commands.registerCommand('datetime.toggleShowDate', async () => {
			await toggleSetting('datetime.showDate');
			updateTime();
		}),
		vscode.commands.registerCommand('datetime.toggleMilitaryTime', async () => {
			await toggleSetting('datetime.militaryTime');
			updateTime();
		}),
		vscode.commands.registerCommand('datetime.toggleCustomFormat', async () => {
			await toggleCustomFormat();
			updateTime();
		}),
		vscode.commands.registerCommand('datetime.toggleInternetConnectionStatus', async () => {
			await toggleSetting('datetime.showInternetConnectionStatus');
			updateTime();
		}),
		vscode.commands.registerCommand('datetime.openMenu', async () => {
			await openQuickMenu(updateTime);
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
