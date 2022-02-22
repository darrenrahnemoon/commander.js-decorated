import 'reflect-metadata';

export function ensureMetadata<T>(metadataKey: string, metadataValue: T, target, propertyKey?: string): T {
	const metadata = Reflect.getMetadata(metadataKey, target, propertyKey);

	if (metadata === undefined) {
		Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
		return metadataValue;
	}

	return metadata;
}
