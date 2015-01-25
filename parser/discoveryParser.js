var fs=require("fs");
var Promise = require('es6-promise').Promise;
var HandleBars= require("handlebars");

var createItemParser=require("./itemParser").createParser;
var createRecipeParser=require("./recipeParser").createParser;

function writeCacheFile(fn,object) {
	var file=fs.openSync(fn,"w");
	var max=Object.keys(object).length;
	var done=0;
	fs.writeSync(file,"{\n");
	for(var k in object) {
		done++;
		fs.writeSync(file,JSON.stringify(k) + " : " 
				+ JSON.stringify(object[k],null,2) + (done!==max?",":"") + "\n");
		process.stdout.clearLine();  // clear current text
		process.stdout.cursorTo(0);  // move cursor to beginning of line
		if(done % 1000 === 0) {
			process.stdout.write("Caching " +fn + ": " + (done/max*100).toFixed(2) + "% (" + done + "/" + max + ")");  // write text
		}
	}
	fs.writeSync(file,"}\n");
	fs.closeSync(file);
}

function extractFile(fn,parser) 
{
	var file=fs.createReadStream(fn,{bufferSize: 4*1048576});
	var readBytes=0;
	var totalSize=(fs.statSync(fn).size/1048576).toFixed(2);
	return new Promise(function(resolve,reject) {
		try {
			var json=JSON.parse(fs.readFileSync(fn +".json"));
			console.log("Using cached parse " + fn + ".json -- Delete this file if you want to reparse");
			resolve(json);
			return;
		} catch(e) {
			// do nothing, just reparse
		}
		file.on("data",function(chunk) {
			readBytes += chunk.length;
			process.stdout.clearLine();  // clear current text
			process.stdout.cursorTo(0);  // move cursor to beginning of line
			process.stdout.write("Parsing " +fn + ": " + (readBytes/1048576).toFixed(2) + " of " + totalSize + "mb");  // write text
			parser.parseString(chunk);
		});
		file.on("end",function() {
			process.stdout.write("\n");
			resolve(parser.itemDb);
			writeCacheFile(fn+".json",parser.itemDb);
		});
	});
}	

extractFile("Items.xml",createItemParser()
).then(function(itemDb) {
	return extractFile("Recipes.xml",createRecipeParser({itemDb: itemDb}))
}).then(function(itemDb) {
	console.log("Found " + Object.keys(itemDb).length + " items.");
	fs.readdirSync(".").forEach(function(f) {
		if(!f.match(".tmpl$")) {
			return;
		}
		var outputFile="../"+f.replace(".tmpl",".lua");
		console.log("Creating " + outputFile +" from " + f);
		var template=HandleBars.compile(fs.readFileSync(f,{encoding: "UTF-8"}));
		var content=template({items:itemDb});
		fs.writeFileSync(outputFile,content);
	});
	
}).catch(function(error) {
	console.error("Failed: ",JSON.stringify(error,null,2));
});