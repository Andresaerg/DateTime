// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
const defaultLocale = Intl.DateTimeFormat().resolvedOptions().locale;

function formatTime(customFormat: string, militaryTime: boolean): string {
	if (militaryTime) {
		return new Date().toLocaleTimeString(defaultLocale, { 
			hour: '2-digit', 
			minute: '2-digit', 
			hour12: false 
		});
	}
	
	if (customFormat) {
		// Simple custom format implementation
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		
		// Replace format tokens
		return customFormat
			.replace(/HH/g, hours.toString().padStart(2, '0'))
			.replace(/H/g, hours.toString())
			.replace(/hh/g, (hours % 12 || 12).toString().padStart(2, '0'))
			.replace(/h/g, (hours % 12 || 12).toString())
			.replace(/mm/g, minutes.toString().padStart(2, '0'))
			.replace(/m/g, minutes.toString())
			.replace(/ss/g, seconds.toString().padStart(2, '0'))
			.replace(/s/g, seconds.toString())
			.replace(/a/g, ampm)
			.replace(/A/g, ampm);
	}
	
	// Default system format
	return new Date().toLocaleTimeString();
}

function getConfigMarkdown(): string {
	// VS Code markdown supports checkboxes (not interactive, but visual)
	// and command links when isTrusted = true. We'll add command links to act like a quick menu.
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);
	const showDate = config.get<boolean>('myExtension.showDate', false);
	const militaryTime = config.get<boolean>('myExtension.militaryTime', false);
	const customFormat = config.get<string>('myExtension.customTimeFormat', '');
	
	const openSettingsLink = `[Open settings](command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify('myExtension'))})`;
	return [
		'**My Extension**',
		'',
		'Settings:',
		`- [${enabled ? 'x' : ' '}] Enable extension — [Toggle](command:myExtension.toggleEnable)`,
		`- [${showDate ? 'x' : ' '}] Show date — [Toggle](command:myExtension.toggleShowDate)`,
		`- [${militaryTime ? 'x' : ' '}] Show military time — [Toggle](command:myExtension.toggleMilitaryTime)`,
		`- [${customFormat ? 'x' : ' '}] Custom format: ${customFormat || 'System default'} — [Toggle](command:myExtension.toggleCustomFormat)`,
		'',
		`[Open menu…](command:myExtension.openMenu)  |  ${openSettingsLink}`
	].join('\n');
}

function updateTime() {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);
	const showDate = config.get<boolean>('myExtension.showDate', false);
	const militaryTime = config.get<boolean>('myExtension.militaryTime', false);
	const customFormat = config.get<string>('myExtension.customTimeFormat', '');
	
	if (!enabled) {
		myStatusBarItem.hide();
		return;
	}
	const date = showDate ? ` ${new Date().toLocaleDateString()}` : '';
	const time = formatTime(customFormat, militaryTime);
	myStatusBarItem.text = `$(watch) ${time}${date}`;
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
				e.affectsConfiguration('myExtension.showDate') ||
				e.affectsConfiguration('myExtension.militaryTime') ||
				e.affectsConfiguration('myExtension.customTimeFormat')
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
		vscode.commands.registerCommand('myExtension.toggleMilitaryTime', async () => {
			await toggleSetting('myExtension.militaryTime');
			updateTime();
		}),
		vscode.commands.registerCommand('myExtension.toggleCustomFormat', async () => {
			await toggleCustomFormat();
			updateTime();
		}),
		vscode.commands.registerCommand('myExtension.openMenu', async () => {
			await openQuickMenu();
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function toggleSetting(section: 'myExtension.enable' | 'myExtension.showDate' | 'myExtension.militaryTime'): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const current = config.get<boolean>(section, true);
	await config.update(section, !current, vscode.ConfigurationTarget.Global);
}

async function toggleCustomFormat(): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const currentFormat = config.get<string>('myExtension.customTimeFormat', '');
	
	if (currentFormat) {
		// If custom format is set, clear it to use system default
		await config.update('myExtension.customTimeFormat', '', vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage('Custom format cleared, using system default');
	} else {
		// If no custom format, prompt user to enter one
		const newFormat = await vscode.window.showInputBox({
			prompt: 'Enter custom time format (e.g., HH:mm:ss, h:mm a)',
			placeHolder: 'Leave empty to use system default',
			value: currentFormat
		});
		
		if (newFormat !== undefined) {
			await config.update('myExtension.customTimeFormat', newFormat, vscode.ConfigurationTarget.Global);
			if (newFormat) {
				vscode.window.showInformationMessage(`Custom format set to: ${newFormat}`);
			}
		}
	}
}

async function openQuickMenu(): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('myExtension.enable', true);
	const showDate = config.get<boolean>('myExtension.showDate', false);
	const militaryTime = config.get<boolean>('myExtension.militaryTime', false);
	const customFormat = config.get<string>('myExtension.customTimeFormat', '');
	const pick = await vscode.window.showQuickPick(
		[
			{ label: `${enabled ? '$(check) ' : ''}Enable extension`, description: enabled ? 'Enabled' : 'Disabled', action: 'toggleEnable' },
			{ label: `${showDate ? '$(check) ' : ''}Show date in status bar`, description: showDate ? 'Shown' : 'Hidden', action: 'toggleShowDate' },
			{ label: `${militaryTime ? '$(check) ' : ''}Show military time`, description: militaryTime ? 'Shown' : 'Hidden', action: 'toggleMilitaryTime' },
			{ label: `${customFormat ? '$(check) ' : ''}Custom time format`, description: customFormat || 'System default', action: 'toggleCustomFormat' },
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
	} else if (pick.action === 'toggleMilitaryTime') {
		await toggleSetting('myExtension.militaryTime');
		updateTime();
	} else if (pick.action === 'toggleCustomFormat') {
		await toggleCustomFormat();
		updateTime();
	} else if (pick.action === 'openSettings') {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'myExtension');
	}
}
