local addon, private = ...

addon.symbols={};
Rifact={
	providers={},
	enrichers={},
	toolTipProviders={}
}

--- Does a deep merge of newFields into the base table
-- @param base The base table to merge into
-- @param newFields The table to merge into the base table.
-- @returns base
function deepMerge(base,newFields)
	if(type(base) ~= "table" or type(newFields) ~= "table") then
		return newFields;
	end
	for k,v in pairs(newFields) do
		if(type(newFields[k]) == "table") then
			if(not base[k]) then
				base[k]={}
			end
			deepMerge(base[k],newFields[k]);
		else
			base[k]=newFields[k];
		end
	end
	return base
end

-- Rifact:registerProvider
addon.symbols["Rifact.registerProvider"] = {
	summary = [[Register a fact provider.  An provider simply adds facts to a description without relying on existing information.]],
	signatures = {"Rifact.registerProvider(provider) -- table"},
	parameter = {
		["provider"] = "A FactProvider to register"
	}
}
--
function Rifact:registerProvider(provider)
	table.insert(Rifact.providers,provider)
end

-- Rifact:registerEnricher
addon.symbols["Rifact.registerEnricher"] = {
	summary = [[Register a fact enricher.  An enricher augments an item by creating
	facts derived from the basic facts.  E.g. an equipment score that based on the sum of weighted item stats.
	]],
	signatures = {"Rifact.registerEnricher(enricher) -- table"},
	parameter = {
		["enricher"] = "A FactEnricher to register"
	}
}
--
function Rifact:registerEnricher(enricher)
	table.insert(Rifact.enrichers,enricher)
end

-- Rifact:registerToolTipProvider
addon.symbols["Rifact.registerToolTipProvider"] = {
	summary = [[Register a tooltip provider.  The provider takes a table of an object
	and returns an array of tooltips.
	]],
	signatures = {"Rifact.registerToolTipProvider(toolTipProvider) -- table"},
	parameter = {
		["toolTipProvider"] = "A ToolTip Provider to register"
	}
}
--
function Rifact:registerToolTipProvider(toolTipProvider)
	table.insert(Rifact.toolTipProviders,toolTipProvider)
end


-- Rifact:facts
addon.symbols["Rifact.facts"] = {
	summary = "Retrieves facts about the given ID.",
	signatures = {"Rifact.facts(id) -- table"},
	parameter = {
		["id"] = "A Rift id for an item, ability, unit, or buff"
	}
}
--
function Rifact:facts(id)
	local facts={}
	if(id == nil) then
		return facts
	end

	for index,provider in ipairs(Rifact.providers) do
		local err,f=pcall(provider.info,id,facts)
		if(not err) then
			print("Error in provider:",err,f);
		elseif(type(f) == "table") then
			facts=deepMerge(facts,f)
		else
--			print("Provider returned a non-table: ",f)
		end
	end

	return facts
end

-- Initialize the config if it's not already done
table.insert(Event.Addon.Load.End,{
	function(addon)
		if(addon=="Rifact") then
			if not Rifact_config then 
				Rifact_config={} 
			end

		end
	end,
	"Rifact", 
	"AddonLoaded"
})
