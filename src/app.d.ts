// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		
		// Khai báo kiểu dữ liệu cho locals
		interface Locals {
			user: {
				uid: string;
				email?: string;
				picture?: string;
				name?: string;
                isPro?: boolean;
			} | null;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
