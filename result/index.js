import { WASI } from "@wasmer/wasi";
import wasiBindings from "@wasmer/wasi/lib/bindings/browser";
import { WasmFs } from "@wasmer/wasmfs";

const getString = (pointer, memory) => {
	let charArray = new Int8Array(
		memory.buffer,                  // WASM's memory
		pointer,                        // char's pointer
		1                               // The string's length
	);
	let k=1;
	while (charArray[charArray.length-1]!=0){
		k=k+1;
		charArray = new Int8Array(
			memory.buffer,                  // WASM's memory
			pointer,                        // char's pointer
			k                               // The string's length
		);
	}
	let string = String.fromCharCode.apply(null, charArray);
	return string.slice(0,-1);
}

window.addEventListener('load', async (_event) => {
	const wasmfs = new WasmFs();
	const wasi = new WASI({
		bindings: {
			...wasiBindings.default,
			fs: wasmfs.fs
		}
	});

	const module = await WebAssembly.compileStreaming(fetch('./main.wasm'));
	const { wasi_snapshot_preview1 } = wasi.getImports(module);

	const memory = new WebAssembly.Memory({ initial: 500 });
	wasi.setMemory(memory);
	const env = { memory };
	// const text = window.sessionStorage.getItem("result");
	let text = null;
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('data')){
		text = urlParams.get('data');
	}
	// let text = "TTFTFTFFFFTFTTTTTFTFFTFFFTFTFFTTFTFFTTTFTFFFTTTTFTTTTFTTTFFFFTTTTFTFFFTFTFTTTTTFTTTFFFTTTTTTTTTFTFFTTTFTFTFTTTFFFFTTTFFFTTFFTTTTTTFTFFTTFFTFTTTFFFTFTFTFTTTFFTTTTFFTTTTTTTTFTTTTTFFTTFFTTTTTTTFTTTTTFFTFFFTTTFFFFTFFFTFFTTTFTFTTTFTFFTTTTTFTFFFFTFTFFTFTFTTFFTTTFTTTFTFFTTFTTTTFTFFTTTTFTFTTTTTFTTFFTFTTFFTTTTFTTTTTTTTTTTTTTTFTTFTFTTTTFTFTFFFFTTTFTFTFFTTTFFFTFTFTTFFTFTFTTTTTTFTTFTFTTFFFFFTTTTFFFTFFTTFTFTTTFTTTTTTTTFTFFFTTFTTTTTTTFFTTTTFTTFFFTTTTFTFFFTTTTTTFTTTTTFTFTTFTTTTTTFFTTTTTFFFTFTTFTFFTFFTTTFFFTFTTTFTTTFTTTFFFTTFTTTTFFTTFTTFFTFFFTFTTFFTFTTFFTTTFFFFTFTFTFFFTFFFTTTF";
	if (text==null){
		return;
	} else if (text.length!=567){
		return;
	} else {
		const reg = /^(T|F)*$/;
		if (text.match(reg)==null){
			return;
		}
	}
	const tarray = Int8Array.from(Array.from(text).map(letter => letter.charCodeAt(0)));
	const array = new Uint8Array(memory.buffer, 0, text.length+1);
	array.set(tarray);

	const instance = await WebAssembly.instantiate(module, { env, wasi_snapshot_preview1 });

	const result = getString(instance.exports.gradeAsJSON(tarray, 0), memory);
	console.log(result);
	const res = JSON.parse(result);
	const div = document.createElement("div");
	res.forEach((i)=>{
		const table = document.createElement("table");
		const tr1 = document.createElement("tr");
		const tr2 = document.createElement("tr");
		Object.keys(i).forEach((k)=>{
			const th = document.createElement("th");
			const td = document.createElement("td");
			th.innerText = k;
			td.innerText = i[k];
			tr1.appendChild(th);
			tr2.appendChild(td);
		})
		table.appendChild(tr1);
		table.appendChild(tr2);
		div.appendChild(table);
	})
	document.querySelector("body").appendChild(div);
	document.getElementById('console').remove();
	// console.log(stdout);
});
