function renderKatex(str){
	let res=katex.renderToString(str,{throwOnError:false});
	return res;
}
function findString(str,pos,ch,dir=1){
	while(pos>=0&&pos<str.length-ch.length+1){
		if(((pos==0||str[pos-1]=='\n')||str[pos-1]!="\\")&&str.substr(pos,ch.length)==ch)
			return pos;
		pos+=dir;
	}
	return -1;
}
function inALine(str,a,b){
	for(let i=a;i<=b;i+=1){
		if(str[i]=="\n")
			return 0;
	}
	return 1;
}
function countChar(str,pos,ch,lim=10000){
	let cnt=0;
	while(cnt<lim&&pos+cnt<str.length&&str[pos+cnt]==ch)
		cnt+=1;
	return cnt;
}
function mdToHtml(str){
	let res="";
	let pos=0;
	while(pos<str.length){
		if(str[pos]=="\n"){
			let newl=1;
			if(str.substr(pos+1).startsWith("> ")){
				let lst=findString(str,pos-1,"\n",-1);
				if(str.substr(lst+1).startsWith("> ")){
					newl=0;
				}
			}
			if(newl)
				res+="<div class=\"md-space-between-line\"></div>";
		}
		if(str[pos]=="$"){ //katex
			if((pos==0||str[pos-1]=="\n")&&pos<str.length-1&&str[pos+1]=="$"){
				let lst=findString(str,pos+2,"$$");
				if(lst!=-1){
					res+="<div class=\"katex-container katex-container-between-line\">"
						+renderKatex(str.substr(pos+2,(lst-1)-(pos+2)+1))
						+"</div>";
					pos=lst+2;
					continue;
				}
			}
			else{
				let lst=findString(str,pos+1,"$");
				if(lst!=-1&&inALine(str,pos,lst)){
					res+="<span class=\"katex-container katex-container-in-line\">"
					   +renderKatex(str.substr(pos+1,(lst-1)-(pos+1)+1))
					   +"</span>";
					pos=lst+1;
					continue;
				}
			}
		}
		if(str[pos]=="-"||str[pos]=="_"){ //seperate line
			let ch=str[pos];
			let cnt=countChar(str,pos,ch);
			if((pos+cnt==str.length||str[pos+cnt]=="\n")&&cnt>=3){
				res+="<div class=\"md-separate-line\"></div>";
				pos+=cnt;
				continue;
			}
		}
		if((str[pos]=="+"||str[pos]=="-")&&(pos==str.length||str[pos+1]==" ")){ //unordered list
			let lst=findString(str,pos+2,"\n");
			if(lst==-1)
				lst=str.length;
			res+="<span class=\"md-unordered-list-element\">"
				+"<span class=\"md-unordered-list-head\"></span>"
				+mdToHtml(str.substr(pos+2,(lst-1)-(pos+2)+1))
				+"</span>";
			pos=lst;
			continue;
		}
		if((pos==0||str[pos-1]=="\n")&&str[pos]==">"){ //quote
			if(pos<str.length-1&&str[pos+1]==" "){
				let lst=findString(str,pos+2,"\n");
				if(lst==-1)
					lst=str.length;
				res+="<div class=\"md-quote\">"
					+mdToHtml(str.substr(pos+2,(lst-1)-(pos+2)+1))
					+"</div>";
				pos=lst;
				continue;
			}
		}
		if((pos==0||str[pos-1]=="\n")&&str[pos]=="#"){ //header
			let cnt=countChar(str,pos,"#",6);
			if(pos+cnt<str.length&&str[pos+cnt]==" "){
				let lst=findString(str,pos+cnt,"\n");
				if(lst==-1)
					lst=str.length;
				res+="<h"+cnt+" class=\"md-header md-header-"+cnt+"\">"
				    +mdToHtml(str.substr(pos+cnt+1,(lst-1)-(pos+cnt+1)+1))
					+"</h"+cnt+">";
				pos=lst;
				continue;
			}
		}
		if(str[pos]=="*"||str[pos]=="_"){ //bold,italic
			let ch=str[pos];
			if(pos<str.length-1&&str[pos+1]==ch){
				let lst=findString(str,pos+2,ch+ch);
				if(lst!=-1&&inALine(str,pos,lst)){
					res+="<span class=\"md-strong\">"
					    +mdToHtml(str.substr(pos+2,(lst-1)-(pos+2)+1))
						+"</span>";
					pos=lst+2;
					continue;
				}
			}
			else{
				let lst=findString(str,pos+1,ch);
				if(lst!=-1&&inALine(str,pos,lst)){
					res+="<span class=\"md-italic\">"
					    +mdToHtml(str.substr(pos+1,(lst-1)-(pos+1)+1))
						+"</span>";
					pos=lst+1;
					continue;
				}
			}
		}
		if(str[pos]=="~"){ //strikeout
			if(pos!=str.length-1&&str[pos+1]=="~"){
				let lst=findString(str,pos+2,"~~");
				if(lst!=-1&&inALine(str,pos,lst)){
					res+="<span class=\"md-strikeout\">"
					    +mdToHtml(str.substr(pos+2,(lst-1)-(pos+2)+1))
						+"</span>";
					pos=lst+2;
					continue;
				}
			}
		}
		if(str[pos]=="`"){ //code block
			if((pos==0||str[pos-1]=="\n")&&pos+2<str.length&&str.substr(pos,3)=="```"){
				let edl=findString(str,pos+3,"\n");
				if(edl!=-1)
				{
					let lang=str.substr(pos+3,(edl-1)-(pos+3)+1);
					let lst=findString(str,pos+3,"```");
					if(lst!=-1&&(lst+3==str.length||str[lst+3]=="\n")){
						res+="<div class=\"md-codebox-between-line md-codebox md-codebox-"+lang+"\">"
						    +str.substr(edl+1,(lst-1)-(edl+1)+1)
						    +"</div>";
						pos=lst+3;	
						continue;
					}
				}
			}
			else{
				let lst=findString(str,pos+1,"`");
				if(lst!=-1&&inALine(str,pos,lst)){
					res+="<span class=\"md-codebox-in-line md-codebox\">"
					    +str.substr(pos+1,(lst-1)-(pos+1)+1)
						+"</span>";
					pos=lst+1;
					continue;
				}
			}
		}
		if(pos!=str.length-1&&str[pos]=="\\"){
			res+=str[pos+1];
			pos+=2;
			continue;
		}
		res+=str[pos];
		pos+=1;
	}
	return res;
}
