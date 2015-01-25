
Rifact:registerProvider({
	info=function(id)
		local detail={}
		local char=id:sub(1,1)
		if(char=="I") then 
			return Inspect.Item.Detail(id)
		elseif(char =="i") then
			local item=Inspect.Item.Detail(id)
			local itemType={}
			if(item and item.type) then
				itemType=Inspect.Item.Detail(item.type)
			end
			if(item and itemType) then
				return deepMerge(itemType,item)
			elseif(item) then
				return item
			elseif(itemType) then
				return itemType
			else
				return {}
			end
		elseif(char =="b") then
		-- need the unit id to do anything with it.  could concat & split
		-- or make the id a table at some point,  I guess
		-- till then, no data for you
			return {} --Inspect.Buff.Detail("self",id)
		elseif(char == "u") then
			return Inspect.Unit.Detail(id)
		elseif(char =="A") then
			return Inspect.Ability.New.Detail(id)
		end

		return detail
	end
})
