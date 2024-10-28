let test = window.sessionStorage.getItem("test");
if (test==null){
	window.location.assign("./");
}
try {
	test = JSON.parse(test);
} catch (e) {
	console.log(e);
	setTimeout(()=>{window.location.assign("./");}, 1000);
}
const h1 = document.createElement("h1");
h1.innerText=test[0];
const form = document.createElement("form");
form.appendChild(h1);

test.forEach((t, i)=>{
	const qdiv = document.createElement("div");
	qdiv.innerText = `${i}. ${t}`;
	const adiv = document.createElement("div");
	const tinput = document.createElement("input");
	const tlabelText = document.createTextNode(" True");
	const tlabel = document.createElement("label");
	const space = document.createTextNode(" ");
	const finput = document.createElement("input");
	const flabelText = document.createTextNode(" False");
	const flabel = document.createElement("label");
	tinput.value = "T";
	tinput.name = `q${i}`;
	tinput.type = "radio";
	tinput.required="required";
	finput.value = "F";
	finput.name = `q${i}`;
	finput.type = "radio";
	finput.required="required";
	if (i==0) {
		tlabelText.deleteData(0,5);
		flabelText.deleteData(0,6);
		tlabelText.appendData(" Male");
		flabelText.appendData(" Female");
		qdiv.innerText = `Select Gender`;
		tinput.value = "M";
		tinput.name = `q${i}`;
		tinput.type = "radio";
		tinput.required="required";
		finput.value = "F";
		finput.name = `q${i}`;
		finput.type = "radio";
		finput.required="required";
	}
	tlabel.appendChild(tinput);
	tlabel.appendChild(tlabelText);
	flabel.appendChild(finput);
	flabel.appendChild(flabelText);
	adiv.appendChild(tlabel);
	adiv.appendChild(space);
	adiv.appendChild(flabel);
	form.appendChild(qdiv);
	form.appendChild(adiv);
})
const submit = document.createElement("input");
submit.value = "Submit";
submit.type = "submit";
form.appendChild(submit)

const supported = (() => {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {
    }
    return false;
})();

form.addEventListener("submit", (e)=>{
	e.preventDefault();
	const data = new FormData(form);
	const dataString = [...data.entries()].map(i=>i[1]).join('');
	window.sessionStorage.setItem("result",dataString);
	window.location.assign((supported ? `./result`:`./result-old`)+`?data=${dataString.slice(1,)}&gender=${dataString[0]}`)
});

document.querySelector("body").appendChild(form);
