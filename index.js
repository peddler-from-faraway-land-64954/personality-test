import { getTestData } from "./decrypt.js"

document.querySelector("button").addEventListener("click", (e)=>{
	e.preventDefault();
	const text = document.querySelector("textarea").value;
	window.sessionStorage.setItem("test", text);
	window.location.assign("./test.html")
})
const func = async ()=>{
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('password')){
		console.log(urlParams.get('password'));
		const data = await getTestData(urlParams.get('password'));
		if (data[0]==true){
			window.sessionStorage.setItem("test", data[1]);
			window.location.assign("./test.html")
		}
	}
	const text = window.sessionStorage.getItem("test");
	if (text!=null){
		document.querySelector("textarea").value=text;
	}
}
document.addEventListener("load", func);
func();
