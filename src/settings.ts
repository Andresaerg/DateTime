import * as vscode from 'vscode';

export function getConfigMarkdown(): string {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('datetime.enable', true);
	const showDate = config.get<boolean>('datetime.showDate', false);
	const militaryTime = config.get<boolean>('datetime.militaryTime', false);
	const customFormat = config.get<string>('datetime.customTimeFormat', '');
	const showInternetConnectionStatus = config.get<boolean>('datetime.showInternetConnectionStatus', false);

	const openSettingsLink = `[Open settings](command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify('datetime'))})`;
	return [
		'**DateTime**',
		'',
		'Settings:',
		`- [${enabled ? 'x' : ' '}] Enable extension — [Toggle](command:datetime.toggleEnable)`,
		`- [${showDate ? 'x' : ' '}] Show date — [Toggle](command:datetime.toggleShowDate)`,
		`- [${militaryTime ? 'x' : ' '}] Show military time — [Toggle](command:datetime.toggleMilitaryTime)`,
		`- [${customFormat ? 'x' : ' '}] Custom format: ${customFormat || 'System default'} — [Toggle](command:datetime.toggleCustomFormat)`,
		`- [${showInternetConnectionStatus ? 'x' : ' '}] Show internet connection status — [Toggle](command:datetime.toggleInternetConnectionStatus)`,
		'',
		`[Open menu…](command:datetime.openMenu)  |  ${openSettingsLink}`
	].join('\n');
}

export type SettingSection = 'datetime.enable' | 'datetime.showDate' | 'datetime.militaryTime' | 'datetime.showInternetConnectionStatus';

export async function toggleSetting(section: SettingSection): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const current = config.get<boolean>(section, true);
	await config.update(section, !current, vscode.ConfigurationTarget.Global);
}

export async function toggleCustomFormat(): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const currentFormat = config.get<string>('datetime.customTimeFormat', '');

	if (currentFormat) {
		await config.update('datetime.customTimeFormat', '', vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage('Custom format cleared, using system default');
	} else {
		const newFormat = await vscode.window.showInputBox({
			prompt: 'Enter custom time format (e.g., HH:mm:ss, h:mm a)',
			placeHolder: 'Leave empty to use system default',
			value: currentFormat
		});

		if (newFormat !== undefined) {
			await config.update('datetime.customTimeFormat', newFormat, vscode.ConfigurationTarget.Global);
			if (newFormat) {
				vscode.window.showInformationMessage(`Custom format set to: ${newFormat}`);
			}
		}
	}
}

export async function openQuickMenu(onUpdate: () => void): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const enabled = config.get<boolean>('datetime.enable', true);
	const showDate = config.get<boolean>('datetime.showDate', false);
	const militaryTime = config.get<boolean>('datetime.militaryTime', false);
	const customFormat = config.get<string>('datetime.customTimeFormat', '');
	const showInternetConnectionStatus = config.get<boolean>('datetime.showInternetConnectionStatus', false);
	
	const pick = await vscode.window.showQuickPick(
		[
			{ label: `${enabled ? '$(check) ' : ''}Enable extension`, description: enabled ? 'Enabled' : 'Disabled', action: 'toggleEnable' },
			{ label: `${showDate ? '$(check) ' : ''}Show date in status bar`, description: showDate ? 'Shown' : 'Hidden', action: 'toggleShowDate' },
			{ label: `${militaryTime ? '$(check) ' : ''}Show military time`, description: militaryTime ? 'Shown' : 'Hidden', action: 'toggleMilitaryTime' },
			{ label: `${customFormat ? '$(check) ' : ''}Custom time format`, description: customFormat || 'System default', action: 'toggleCustomFormat' },
			{ label: `${showInternetConnectionStatus ? '$(check) ' : ''}Show internet connection status`, description: showInternetConnectionStatus ? 'Shown' : 'Hidden', action: 'toggleInternetConnectionStatus' },
			{ label: '$(gear) Open settings…', action: 'openSettings' }
		],
		{ placeHolder: 'DateTime Quick Menu', ignoreFocusOut: true }
	);

	if (!pick) {
		return;
	}

	if (pick.action === 'toggleEnable') {
		await toggleSetting('datetime.enable');
		onUpdate();
	} else if (pick.action === 'toggleShowDate') {
		await toggleSetting('datetime.showDate');
		onUpdate();
	} else if (pick.action === 'toggleMilitaryTime') {
		await toggleSetting('datetime.militaryTime');
		onUpdate();
	} else if (pick.action === 'toggleCustomFormat') {
		await toggleCustomFormat();
		onUpdate();
	} else if (pick.action === 'toggleInternetConnectionStatus') {
		await toggleSetting('datetime.showInternetConnectionStatus');
		onUpdate();
	} else if (pick.action === 'openSettings') {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'datetime');
	}
}
