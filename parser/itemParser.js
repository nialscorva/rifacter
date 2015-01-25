var xml = require("node-xml");
var setDeepValue = require("./shared").setDeepValue;


module.exports={};

module.exports.createParser=function(config) {
	config=config || {};
	var rootElement=config.rootElement || "Item";
	var key=config.key ||"ItemKey";
	var ignoredElements=config.ignoredElements || ["FirstLootedBy"];
	var itemDb=config.itemDb || {};
	var parser=new xml.SaxParser(function(cb) {
		var ignoredElement=null;
		var stack=[];
		var currentText="";
		var currentItem;
		var itemDb=config.itemDb || {};
		
		cb.onStartDocument(function() {
			parser.itemDb=itemDb;
		});
		cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
			if(ignoredElement) {
				return;
			}
			if(ignoredElements.indexOf(elem) >=0) {
				ignoredElement=elem;
				return;
			}
			if(elem===rootElement && stack.length==0) {
				currentItem={};
			} else if(currentItem) {
				stack.push(elem);
			}
		});
		cb.onEndElementNS(function(elem, prefix, uri) {
			if(ignoredElement===elem) {
				ignoredElement=null;
				return;
			}
			if(ignoredElement) {
				currentText="";
				return;
			}
			if(elem===rootElement && stack.length==0) {
				itemDb[currentItem[key]]=currentItem;
			} else {
			
				currentText=currentText.replace(/^\s+|\s+$/g, '');
				if(currentText && currentItem) {
					setDeepValue(currentItem,stack,currentText);
				}
				stack.pop();
			}
			currentText="";
		});
		cb.onCharacters(function(chars) {
			currentText+=chars;
		});
		cb.onWarning(function(msg) {
				console.log('<WARNING>'+msg+"</WARNING>");
		});
		cb.onError(function(msg) {
				console.error('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
		});
	});
	parser.itemDb=itemDb;
	return parser;
}


