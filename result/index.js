import { WASI } from "@wasmer/wasi";
import wasiBindings from "@wasmer/wasi/lib/bindings/browser";
import { WasmFs } from "@wasmer/wasmfs";
import Chart from 'chart.js/auto';
const drawChart = async (a, b) => {
	const data = [
		a,
		b
	];

	const footer = (tooltipItems) => {
		let total = data[0]+data[1];
		let sum = 0.0;

		tooltipItems.forEach(function(tooltipItem) {
			sum += tooltipItem.parsed.x;
		});
		return 'Percentage: ' + sum*100/total;
	};

	new Chart(
		document.getElementById('acquisitions'),
		{
			type: 'bar',
			data: {
				labels: ["True/False"],
				datasets: [
					{
						label: 'True',
						data: [data[0]]
					},
					{
						label: 'False',
						data: [data[1]]
					}
				]
			},
			options: {
				indexAxis: 'y',
				plugins: {
					// title: {
					// 	display: true,
					// 	text: 'Chart.js Bar Chart - Stacked'
					// },
					tooltip: {
						callbacks: {
							footer: footer
						}
					}
				},
				responsive: true,
				scales: {
					y: {
						stacked: true,
						display: false,
					},
					x: {
						stacked: true,
						display: false,
					},
				}
			}
		})
};

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
	drawChart(res[0]["raw"], res[1]["raw"]);
	const cols = [
		"name", "description", "raw", "KScore", "tscore", "percentile"
	]
	let qtables = []
	const div = document.createElement("div");
	const table = document.createElement("table");
	{
		const tr = document.createElement("tr");
		cols.forEach((i)=>{
			const th = document.createElement("th");
			th.innerText = i;
			tr.appendChild(th);
		})
		table.appendChild(tr);
	}
	res.forEach((i)=>{
		if (Object.keys(i).includes("Questions")){
			qtables.push(i);
			return;
		}
		const tr = document.createElement("tr");
		cols.forEach((k)=>{
			const td = document.createElement("td");
			td.innerText = i[k]?i[k]:"";
			tr.appendChild(td);
		})
		table.appendChild(tr);
	})
	div.appendChild(table);
	const qtable = document.createElement("table");
	{
		const cols = [
			"name", "description", "qs", "ans", "txt"
		]
		const tr = document.createElement("tr");
		cols.forEach((i)=>{
			const th = document.createElement("th");
			th.innerText = i;
			tr.appendChild(th);
		})
		qtable.appendChild(tr);

	}
	let test = window.sessionStorage.getItem("test");
	let ptest;
	if (test!=null){
		ptest = JSON.parse(test);
	}
	qtables.forEach((i)=>{
		const name = i["name"];
		const desc = i["description"];
		i["Questions"]
			.toSorted((a,b)=>{
				return a[1]-b[1];
			})
			.forEach((j)=>{
			const tr = document.createElement("tr");
			const tdname = document.createElement("td");
			const tddesc = document.createElement("td");
			const tdqs = document.createElement("td");
			const tdans = document.createElement("td");
			const tdtxt = document.createElement("td");
			tdname.innerText = name;
			tddesc.innerText = desc;
			tdqs.innerText = j[0];
			tdans.innerText = j[1];
			tdtxt.innerText = "AAA";
			if (test!=null){
				tdtxt.innerText = ptest[j[0]];
			}
			[tdname, tddesc, tdqs, tdans, tdtxt].forEach((x)=>{
				tr.appendChild(x);
			})
			qtable.appendChild(tr);
		})
	})
	div.appendChild(qtable);
	document.querySelector("body").appendChild(div);
	document.getElementById('console').remove();
	// console.log(stdout);
});

