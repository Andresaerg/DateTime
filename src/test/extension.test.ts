import * as assert from 'assert';
import * as vscode from 'vscode';
import { formatTime } from '../time';

suite('DateTime Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Store original configuration to restore after tests
	let originalEnable: boolean | undefined;
	let originalShowDate: boolean | undefined;
	let originalMilitaryTime: boolean | undefined;
	let originalCustomTimeFormat: string | undefined;
	let originalShowInternetConnectionStatus: boolean | undefined;

	suiteSetup(async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		originalEnable = config.get<boolean>('enable');
		originalShowDate = config.get<boolean>('showDate');
		originalMilitaryTime = config.get<boolean>('militaryTime');
		originalCustomTimeFormat = config.get<string>('customTimeFormat');
		originalShowInternetConnectionStatus = config.get<boolean>('showInternetConnectionStatus');
	});

	suiteTeardown(async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		await config.update('enable', originalEnable, vscode.ConfigurationTarget.Global);
		await config.update('showDate', originalShowDate, vscode.ConfigurationTarget.Global);
		await config.update('militaryTime', originalMilitaryTime, vscode.ConfigurationTarget.Global);
		await config.update('customTimeFormat', originalCustomTimeFormat, vscode.ConfigurationTarget.Global);
		await config.update('showInternetConnectionStatus', originalShowInternetConnectionStatus, vscode.ConfigurationTarget.Global);
	});

	test('Time Formatting Logic - Military Time', () => {
		const result = formatTime('', true);
		// Military time format: e.g. 14:05 (HH:mm)
		assert.match(result, /^\d{2}:\d{2}$/, `Expected 24h format (HH:mm), got: ${result}`);
	});

	test('Time Formatting Logic - Custom Format', () => {
		// Test standard replacements
		const customPattern = 'HH/mm/ss A';
		const result = formatTime(customPattern, false);
		// e.g. 14/05/23 AM or 02/05/23 PM
		assert.match(result, /^\d{2}\/\d{2}\/\d{2} (AM|PM)$/, `Expected format (HH/mm/ss A), got: ${result}`);
	});

	test('Time Formatting Logic - Custom Format single digit', () => {
		const customPattern = 'h-m-s a';
		const result = formatTime(customPattern, false);
		// e.g. 2-5-23 am or 12-5-23 pm
		assert.match(result, /^\d{1,2}-\d{1,2}-\d{1,2} (AM|PM)$/i, `Expected format (h-m-s a), got: ${result}`);
	});

	test('Extension Command - datetime.toggleEnable', async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		const initialValue = config.get<boolean>('enable');

		await vscode.commands.executeCommand('datetime.toggleEnable');
		
		const newValue = config.get<boolean>('enable');
		assert.strictEqual(newValue, !initialValue, 'datetime.enable should be toggled');
	});

	test('Extension Command - datetime.toggleShowDate', async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		const initialValue = config.get<boolean>('showDate');

		await vscode.commands.executeCommand('datetime.toggleShowDate');
		
		const newValue = config.get<boolean>('showDate');
		assert.strictEqual(newValue, !initialValue, 'datetime.showDate should be toggled');
	});

	test('Extension Command - datetime.toggleMilitaryTime', async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		const initialValue = config.get<boolean>('militaryTime');

		await vscode.commands.executeCommand('datetime.toggleMilitaryTime');
		
		const newValue = config.get<boolean>('militaryTime');
		assert.strictEqual(newValue, !initialValue, 'datetime.militaryTime should be toggled');
	});

	test('Extension Command - datetime.toggleInternetConnectionStatus', async () => {
		const config = vscode.workspace.getConfiguration('datetime');
		const initialValue = config.get<boolean>('showInternetConnectionStatus');

		await vscode.commands.executeCommand('datetime.toggleInternetConnectionStatus');
		
		const newValue = config.get<boolean>('showInternetConnectionStatus');
		assert.strictEqual(newValue, !initialValue, 'datetime.showInternetConnectionStatus should be toggled');
	});
});
