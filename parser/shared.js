var Promise = require('es6-promise').Promise;
var xml = require("node-xml");
var fs=require("fs");

function JsonToLua(obj,indent) {
	indent=indent || "  ";
	var s="";
	if(Array.isArray(obj)) {
		var s="{\n";
		obj.forEach(function(v) {
			s+=indent+JsonToLua(v,indent+"  ")+",\n";
		});
		return s;
	}
	
	switch(typeof obj) {
		case "object":
			var s="{\n";
			for(var k in obj) {
				s+=indent+"[\""+k+"\"]=" + JsonToLua(obj[k],indent+"  ") + ",\n";
			}
			s+=indent+"}";
			return s;
		case "string":
			return "\""+obj+"\"";
		case "number":
			return obj;
		default:
			return "UNKNOWN OBJECT: "+obj;
	}
}
function setDeepValue(obj,path,value) {
	var pos=obj;
	// all but the last segment
	for(var i=0;i<path.length-1;++i) {
		// create if the object doesn't exist
		if(!pos[path[i]]) {
			pos[path[i]]={}
		}
		pos=pos[path[i]];
	}
	// last field is actually a field
	var f=path[path.length-1];
	if(pos[f]) {
		if(!Array.isArray(pos[f])) {
			pos[f]=[pos[f]];
		}
		pos[f].push(value);
	} else {
		pos[f]=value
	}
}
module.exports = {
	"jsonToLua": JsonToLua,
	"setDeepValue": setDeepValue
}
