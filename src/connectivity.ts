import * as vscode from 'vscode';
import * as dns from 'dns';

export class ConnectivityMonitor {
	private cachedStatus = false;
	private hasCheckedInitialStatus = false;
	private intervalId: ReturnType<typeof setInterval> | undefined;

	public start(onStatusChange: (connected: boolean) => void) {
		const check = () => {
			dns.resolve('www.google.com', (err) => {
				const newStatus = !err;
				
				const config = vscode.workspace.getConfiguration();
				const showInternetConnectionStatus = config.get<boolean>('datetime.showInternetConnectionStatus', false);

				if (this.hasCheckedInitialStatus && this.cachedStatus !== newStatus && showInternetConnectionStatus) {
					onStatusChange(newStatus);
				}

				this.cachedStatus = newStatus;
				this.hasCheckedInitialStatus = true;
			});
		};

		check();
		this.intervalId = setInterval(check, 5000);
	}

	public stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	public isConnected(): boolean {
		return this.cachedStatus;
	}
}
