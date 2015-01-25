if(not ApiBrowser) then
	return -- Don't process the remaining file if ApiBrowser is not installed
end

local summary = "Rifact provides a consistent interface to get facts about Rift items, NPCs, and other objects."

local Addon = ...
ApiBrowser.AddLibraryWithRiftLikeCatalogIndex(Addon.identifier, Addon.toc.Name, summary, Addon.symbols)