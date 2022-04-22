const fs = require("fs");
const express = require("express");
const {resolve} = require("path")
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
filearguments.forEach(path => {
	filelist.push(resolve(process.cwd(), path))
});
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
