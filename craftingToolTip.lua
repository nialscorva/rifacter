local addon, private = ...



function makeTooltip(facts)
	local s=""
	if(facts.craftSkill) then
		for k,v in pairs(facts.craftSkill) do
			s=s..k.."("..string.tostring(v.min).."-"..string.tostring(v.max)..")\n"
		end
	end
	return s
end

Rifact:registerToolTipProvider({
	info=function(id,facts)
		if(id:sub(1,1) == "i" and facts.type) then
			return items[facts.type]
		end
		return items[id]
	end
})

-----------------------------------------------------------------------------------------------------
-- Tooltip generation code.  Simply positions, sizes and sets the text to display, then displays it!
-----------------------------------------------------------------------------------------------------
function onShowToolTip(tipType,shown,buff)
	itemInfoContext:SetVisible(false)
	itemType, itemId,itemBuff = Inspect.Tooltip()
	if(itemId == nil) then
		return
	end

	local facts=Rifact:facts(itemId)
	
	local tipString=makeTooltip(facts)
	
	itemInfoTooltipFrame:SetPoint("BOTTOMRIGHT", UI.Native.Tooltip, "BOTTOMLEFT", 5, 0)

	itemInfoTooltipText:SetPoint("TOPLEFT", itemInfoTooltipFrame, "TOPLEFT", itemInfoXPADDING, itemInfoYPADDING)
	itemInfoTooltipText:SetText(tipString)
	itemInfoTooltipText:SetFontColor(1, 1, 1)
	itemInfoTooltipText:SetFontSize(13)

	itemInfoTooltipFrame:SetWidth(itemInfoTooltipText:GetWidth() + itemInfoXPADDING * 2)
	itemInfoTooltipFrame:SetHeight(itemInfoTooltipText:GetHeight() + itemInfoYPADDING * 2)

	itemInfoContext:SetVisible(true)
end

Command.Event.Attach(Event.Tooltip, onShowToolTip, "Tooltip Handler")