// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

function getConfigMarkdown(): string {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);
	const showDate = config.get<boolean>('myExtension.showDate', false);

	// VS Code markdown supports checkboxes (not interactive, but visual)
	// and command links when isTrusted = true. We'll add command links to act like a quick menu.
	const openSettingsLink = `[Open settings](command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify('myExtension'))})`;
	return [
		'**My Extension**',
		'',
		'Settings:',
		`- [${enabled ? 'x' : ' '}] Enable extension — [Toggle](command:myExtension.toggleEnable)`,
		`- [${showDate ? 'x' : ' '}] Show date — [Toggle](command:myExtension.toggleShowDate)`,
		'',
		`[Open menu…](command:myExtension.openMenu)  |  ${openSettingsLink}`
	].join('\n');
}

function updateTime() {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);

	if (!enabled) {
		myStatusBarItem.hide();
		return;
	}
	const showDate = config.get<boolean>('myExtension.showDate', false);
	const date = showDate ? ` ${new Date().toLocaleDateString()}` : '';
	myStatusBarItem.text = `$(clock) ${new Date().toLocaleTimeString()}${date}`;
	const tooltip = new vscode.MarkdownString(getConfigMarkdown());
	tooltip.isTrusted = true; // allow command: links
	tooltip.supportThemeIcons = true;
	myStatusBarItem.tooltip = tooltip;
	myStatusBarItem.command = 'myExtension.openMenu';
	myStatusBarItem.show();
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// This will show the status bar item as soon as the extension is activated,
	// which happens when VS Code loads if you add a "*"-activation event in package.json.
	updateTime();
	setInterval(updateTime, 1000);

	// Optionally, update the status bar if configuration changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (
				e.affectsConfiguration('myExtension.enable') ||
				e.affectsConfiguration('myExtension.showDate')
			) {
				updateTime();
			}
		})
	);

	// Commands used by tooltip links and click action
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.toggleEnable', async () => {
			await toggleSetting('myExtension.enable');
			updateTime();
		}),
		vscode.commands.registerCommand('myExtension.toggleShowDate', async () => {
			await toggleSetting('myExtension.showDate');
			updateTime();
		}),
		vscode.commands.registerCommand('myExtension.openMenu', async () => {
			await openQuickMenu();
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function toggleSetting(section: 'myExtension.enable' | 'myExtension.showDate'): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const current = config.get<boolean>(section, true);
	await config.update(section, !current, vscode.ConfigurationTarget.Global);
}

async function openQuickMenu(): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);
	const showDate = config.get<boolean>('myExtension.showDate', false);

	const pick = await vscode.window.showQuickPick(
		[
			{ label: `${enabled ? '$(check) ' : ''}Enable extension`, description: enabled ? 'Enabled' : 'Disabled', action: 'toggleEnable' },
			{ label: `${showDate ? '$(check) ' : ''}Show date in status bar`, description: showDate ? 'Shown' : 'Hidden', action: 'toggleShowDate' },
			{ label: '$(gear) Open settings…', action: 'openSettings' }
		],
		{ placeHolder: 'My Extension', ignoreFocusOut: true }
	);

	if (!pick) {
		return;
	}

	if (pick.action === 'toggleEnable') {
		await toggleSetting('myExtension.enable');
		updateTime();
	} else if (pick.action === 'toggleShowDate') {
		await toggleSetting('myExtension.showDate');
		updateTime();
	} else if (pick.action === 'openSettings') {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'myExtension');
	}
}
