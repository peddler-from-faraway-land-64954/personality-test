let test = window.sessionStorage.getItem("test");
if (test==null){
	window.location.assign("/");
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

test.forEach((t, i)=>{
	if (i==0) return;
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

form.addEventListener("submit", (e)=>{
	e.preventDefault();
	const data = new FormData(form);
	const dataString = [...data.entries()].map(i=>i[1]).join('');
	window.sessionStorage.setItem("result",dataString);
	window.location.assign("./result")
});

document.querySelector("body").appendChild(h1);
document.querySelector("body").appendChild(form);
