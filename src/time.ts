const defaultLocale = Intl.DateTimeFormat().resolvedOptions().locale;

export function formatTime(customFormat: string, militaryTime: boolean): string {
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
