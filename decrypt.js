import { Buffer } from 'buffer'

const salt = new Uint8Array([
	176, 191, 38, 120, 209, 152,
	64, 221, 64, 106,  54, 173,
	96,  41,  5,  89
]);

const iv = new Uint8Array([
	237, 174, 123,   3, 156,
	50, 207, 131, 167, 248,
	193,  98
]);

/*
	Get some key material to use as input to the deriveKey method.
	The key material is a password supplied by the user.
	*/
	function getKeyMaterial(password) {
		const enc = new TextEncoder();
		return crypto.subtle.importKey(
			"raw",
			enc.encode(password),
			"PBKDF2",
			false,
			["deriveBits", "deriveKey"],
		);
	}

async function decrypt(ciphertext, salt, iv, password) {
	const keyMaterial = await getKeyMaterial(password);
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	let ret;
	try {
		ret = [true, await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)];
	} catch (e){
		ret = [false, new Uint8Array([])];
	}
	return ret;
}

const getTestData = async (password) => {
	let f = await fetch("./encrypted.txt");
	let txt = await f.text();
	const myBuffer = Buffer.from(txt, 'base64');
	let x = await decrypt(myBuffer, salt, iv, password);
	if (x[0]) {
		x[1] = Buffer.from(x[1]).toString('utf-8');
	} else {
		x[1] = "[]";
	}
	return x;
}
export { getTestData }
