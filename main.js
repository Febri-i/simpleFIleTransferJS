const fs = require("fs");
const express = require("express")
const app = express();

let filearguments = process.argv.slice(2);

let port = 3000;

filearguments = filearguments.filter((item, index) => {
   if( item !== "-p" ){
      if( filearguments[index - 1] == "-p" ){
         port = parseInt(item);
	 return false;
      }
     return true;
   }
   return false;
});



let filelist = [];

const workingDirectory = process.cwd()


for(let i = 0; i < filearguments.length; i++){
   let fileArgumentDir = filearguments[i];
   
   if(fileArgumentDir[0] == "." && fileArgumentDir[1] == "/"){
      fileArgumentDir = workingDirectory + fileArgumentDir.slice(1);
   }else if(fileArgumentDir[0] !== "/"){
      fileArgumentDir = workingDirectory + "/" + fileArgumentDir;
   };

   fileArgumentDir = simplifyDir(fileArgumentDir);

   if(fs.existsSync(fileArgumentDir)){
	if(fs.lstatSync(fileArgumentDir).isDirectory()){
	   const files = fs.readdirSync(fileArgumentDir)
	   for(let ind = 0; ind < files.length; ind++){
	      const filePath = fileArgumentDir + "/" + files[ind];
	      if(!fs.lstatSync(filePath).isDirectory())
	         filelist.push(filePath);
	   }
	}else
	   filelist.push(fileArgumentDir);
   }else{
      console.log("ERROR " + fileArgumentDir + " IS NOT EXIST");
      i = filearguments.length
      filelist = []
   }
  
};

if(filelist.length){

app.get("/get/:index", (req, res)=>{
   const index = parseInt(req.params.index);
   if(isNaN(index))
	res.sendStatus(404);
   else if(index < filelist.length)
	res.download(filelist[index])
});

app.get("/", (req, res)=> {
   res.send(`
   	<style>
	*{
	   padding: 0;
	   margin: 0;
	}

	table {
	   border-collapse: collapse;
	}

	td {
	   border: 1px solid black;
	   padding: 4px;
	}
	</style>
	<main style="display: flex; width: 100vw; height: 100vh; justify-content: center; align-items: center;">
	   <table>
	     ${ filelist.map((item, index) => (`<tr> <td>${item.split("/")[(item[item.length - 1].length ? item.split("/").length - 1 : item.split("/").length - 2 )]}</td> <td> <a href="/get/${index}">Download</td> </tr>`) ).join("\n")}
	   </table>
	</main>
	   `)

});

app.listen(port, () => {
   console.log("listening to port " + port)
})
};

function simplifyDir(dir){
  let dirs = [];
  const spliced = dir.split("/");
  spliced.forEach((item, index) => {
     if(item.length && item !== "..")
	  dirs.push(item);
     if(item == "..")
	  dirs.pop()
  })
  return "/" + dirs.join("/")
};
