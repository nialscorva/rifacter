local addon, private = ...

-- Define our tooltip frames
local itemInfoContext = UI.CreateContext("itemInfoTooltip")
local itemInfoTooltipFrame = UI.CreateFrame("Texture", "itemInfoTooltipFrame", itemInfoContext)
local itemInfoTooltipText = UI.CreateFrame("Text", "itemInfoTooltipText", itemInfoContext)

-- Initialize our tooltip frames so they're displayed and layered properly.  Hide it since we don't need it initially
itemInfoContext:SetStrata("topmost")
itemInfoTooltipFrame:SetTexture("Rift", "ItemToolTip_I75.dds")
itemInfoTooltipFrame:SetLayer(1)
itemInfoTooltipText:SetLayer(2)
itemInfoContext:SetVisible(false)

-- Padding variables so that we can change the position of the text in the frame
local itemInfoXPADDING = 10
local itemInfoYPADDING = 5

local function printTable(t,prefix)
	if(not prefix) then prefix = "" end
	if(type(t) ~= "table") then return t end
	local s="";
	for k,v in pairs(t) do
		if(type(t[k]) == "table") then
			s = s .. printTable(t[k],prefix..k..".")
		else
			local valString=string.tostring(t[k])
			s = s .. prefix .. k .. "=" ..valString:sub(1,30) .. "\n";
		end
	end
	return s
end


function makeTooltip(facts)
	local s=""
	if(facts.craftSkill) then
		for k,v in pairs(facts.craftSkill) do
			s=s..k.."("..string.tostring(v.min).."-"..string.tostring(v.max)..")\n"
		end
	end
	return s
end


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
	if(not facts) then
		return
	end
	
	local tipString=""
	for index,provider in ipairs(Rifact.toolTipProviders) do
		local err,f=pcall(provider.exec,facts)
		if(not err) then
			print("Error in toolTipProviders:",err,f);
		elseif(type(f) == "table") then
			for i,tip in ipairs(f) do
				tipString=tipString .. tip .. "\n"
			end
		elseif(type(f) == "string") then
			tipString=tipString .. f .. "\n"
		else
			print("TooltipProvider returned a bad value:",f)
		end
	end
	
	if(not tipString) then return end
	
	itemInfoTooltipFrame:SetPoint("BOTTOMRIGHT", UI.Native.Tooltip, "BOTTOMLEFT", 5, 0)

	itemInfoTooltipText:SetPoint("TOPLEFT", itemInfoTooltipFrame, "TOPLEFT", itemInfoXPADDING, itemInfoYPADDING)
	itemInfoTooltipText:SetText(tipString,true)
	itemInfoTooltipText:SetFontColor(1, 1, 1)
	itemInfoTooltipText:SetFontSize(13)

	itemInfoTooltipFrame:SetWidth(itemInfoTooltipText:GetWidth() + itemInfoXPADDING * 2)
	itemInfoTooltipFrame:SetHeight(itemInfoTooltipText:GetHeight() + itemInfoYPADDING * 2)

	itemInfoContext:SetVisible(true)
end

Command.Event.Attach(Event.Tooltip, onShowToolTip, "Tooltip Handler")