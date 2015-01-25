var Promise = require('es6-promise').Promise;
var xml = require("node-xml");
var fs=require("fs");
var setDeepValue = require("./shared").setDeepValue;

module.exports={};

module.exports.createParser=function(config) {
	var itemDb=config.itemDb || {};
	function findItem(key,currentItem) {
		if(itemDb[key]) {
			return itemDb[key];
		}
		console.log("Didn't find item",key,currentItem);
		return itemDb[key]=currentItem;
	};
	var parser=new xml.SaxParser(function(cb) {
		var currentRecipe;
		var itemList=[];
		var currentItem;
		var namedObjectStack=[];
		var currentText="";
		var ignoreItem=false;

		cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
			switch(elem) {
				case "Item":
					currentItem={name:{}};
					namedObjectStack.unshift(currentItem);
					break;
				case "Recipe":
					currentRecipe={name:{}};
					namedObjectStack.unshift(currentRecipe);
					break;
				case "Creates":
					ignoreItem=false;
					itemList=[];
					break;
				case "Ingredients":
					ignoreItem=false;
					itemList=[];
					break;

			};
		});
		cb.onEndElementNS(function(elem, prefix, uri) {
			currentText=currentText.replace(/^\s+|\s+$/g, '');
			switch(elem) {
				// Item Parsing
				case "Item":
					if(!ignoreItem) {
						var item=findItem(currentItem.key,currentItem);
						itemList.push(item);
					};
					currentItem=null;
					namedObjectStack.shift();
					break;
				case "ItemKey":
					currentItem.key=currentText;
					break;
				case "AddonType":
					currentItem.addonType=currentText;
					break;
				
				// All named object parsing
				case "English":
					namedObjectStack[0].name.English=currentText;
					break;			
				case "French":
					namedObjectStack[0].name.French=currentText;
					break;			
				case "German":
					namedObjectStack[0].name.German=currentText;
					break;			
				
				
				// Recipe Parsing
				case "Creates":
					currentRecipe.creates=itemList;
					break;
				case "Ingredients":
					currentRecipe.ingredients=itemList;
					break;
				case "RequiredSkill":
					currentRecipe.skill=currentText;
					break;
				case "RequiredSkillPoints":
					currentRecipe.requiredSkill=currentText;
					break;
				case "HighUntil":
					currentRecipe.highUntil=currentText;
					break;
				case "MediumUntil":
					currentRecipe.mediumUntil=currentText;
					break;
				case "LowUntil":
					currentRecipe.lowUntil=currentText;
					break;
				case "Id":
					currentRecipe.id=currentText;
					break;
				case "Recipe":
					itemDb[currentRecipe.id]=currentRecipe;
					currentRecipe.ingredients.forEach(function(i) {
						i.recipes=i.recipes || [];
						i.recipes.push({
							"name":currentRecipe.name,
							"id": currentRecipe.id
						});
						i.craftSkill=i.craftSkill || {};
						var skillInfo=i.craftSkill[currentRecipe.skill];
						if(!skillInfo) {
							skillInfo=i.craftSkill[currentRecipe.skill]={};
						}
						
						["lowUntil","mediumUntil","highUntil","requiredSkill"].forEach(
							function(attr) {
								skillInfo[attr]=skillInfo[attr] || { 
									min: currentRecipe[attr],
									max: currentRecipe[attr]
								};
								skillInfo[attr].min=Math.min(currentRecipe[attr],skillInfo[attr].min);
								skillInfo[attr].max=Math.max(currentRecipe[attr],skillInfo[attr].max);
						});
					});
					namedObjectStack.shift();
					break;
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
};
