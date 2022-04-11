function renderKatex(str){
	katex.render(str,document.getElementById("katex-render-temp"),{
		throwOnError:false
	});
	let res=document.getElementById("katex-render-temp").innerHTML;
	document.getElementById("katex-render-temp").innerHTML="";
	return res;
}
function findChar(str,pos,ch){
	while(pos<str.length){
		if(str[pos]==ch)
			return pos;
	}
	return -1;
}
function mdToHtml(str){
	let res="";
	let pos=0;
	while(pos<str.length){
		if(str[pos]=="$"){
			if(pos<str.length-1&&str[pos+1]=="$"){
				let lst=findChar(str,pos+2,"$");
				if(lst!=-1){
					res+="<div class=\"katex katex-between-line\">"
						+renderKatex(str.substr(pos+2,(lst-1)-(pos+2)+1))
						+"</div>";
				}
				pos=lst+2;
			}
			else{
				let lst=findChar(str,pos+1,"$");
				if(lst!=-1){
					res+="<span class=\"katex katex-in-line\">"
					   +renderKatex(str.substr(pos+1,(lst-1)-(pos+1)+1))
					   +"</div>"
				}
			}
		}
	}
}