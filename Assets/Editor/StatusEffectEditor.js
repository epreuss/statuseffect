#pragma strict

@CustomEditor (StatusEffect)
class StatusEffectEditor extends Editor 
{
	var script: StatusEffect;

    function OnInspectorGUI()
    {   
        script = target;
		
        if (ShowIsChild())
        {
			var message = "This box must be checked as true ONLY if this Status Effect" + 
				" is inside of the Effects list of another Status Effect, which is its parent." + 				
				" Also, move this Status Effect to its parent's transform." +
				" Then, this Status Effect will be applied according to the selected mode.";
			EditorGUILayout.HelpBox(message, UnityEditor.MessageType.None);
        	ShowMode();        	
        }
    	EditorGUILayout.Space();  
        
		ShowEffectsList();
		EditorGUILayout.Space();
  
  		ShowDuration();
    	EditorGUILayout.Space();

		if (!script.IsInstant())
		{
			ShowDuplicationOptions();
			EditorGUILayout.Space();
		}		               
		
		ShowHUD();      
        EditorGUILayout.Space();  
    }

    private function ShowIsChild()
    {
    	ShowBoldLabel("Recursive Effects");
        script.isChild = EditorGUILayout.Toggle("Is Child", script.isChild);
        return script.isChild;
    }

    private function ShowMode()
    {
        script.mode = EditorGUILayout.EnumPopup("Activation Mode", script.mode);
    }

    private function ShowHUD()
    {
		if (script.IsInstant())
		{
			script.showHUD = false;
			return;
		}
		
    	ShowBoldLabel("HUD");
        script.showHUD = EditorGUILayout.Toggle("Show On HUD", script.showHUD);	
        if (script.showHUD)
		{
        	script.icon = EditorGUILayout.ObjectField("Sprite Icon", script.icon, typeof(Sprite)) as Sprite;
			script.color = EditorGUILayout.ColorField("Color", script.color);
		}
		else
		{
			script.icon = null;
			script.color = Color.white;
		}
    }

    private function ShowEffectsList()
    {
        ShowBoldLabel("Effects");
        var list = script.myEffects;
    	var newCount = Mathf.Max(0, EditorGUILayout.IntField("Size", list.Count));
		while (newCount < list.Count)
		    list.RemoveAt(list.Count - 1);
		while (newCount > list.Count)
		    list.Add(null);
    	for (var i = 0; i < list.Count; i++)
		    list[i] = EditorGUILayout.ObjectField("Element " + i, list[i], typeof(Effect)) as Effect;
    }

    private function ShowDuration()
    {
    	ShowBoldLabel("Duration Options");
    	script.durationType = EditorGUILayout.EnumPopup("Duration Type", script.durationType);
    	if (script.IsInstant())
    	{
  			script.duration = 0;
  			script.useTicks = false;
  			script.totalTicks = 3;
  		}
		else if (script.IsPermanent())
		{
			script.duration = 0;
			script.useTicks = EditorGUILayout.Toggle("Use Tick", script.useTicks);
			if (script.useTicks)
			{
				script.delayInSecs = EditorGUILayout.Slider("Delay In Secs", script.delayInSecs, 0.1, 10);     
				script.startWithTick = EditorGUILayout.Toggle("Start with Tick", script.startWithTick);
			}
			else
			{
				script.startWithTick = true;
				script.delayInSecs = 0.1;
			}
		}
  		else
  		{
  			script.duration = EditorGUILayout.FloatField("Duration", script.duration);
			if (script.duration < 0.1)
				script.duration = 0.1;
			script.useTicks = EditorGUILayout.Toggle("Use Tick", script.useTicks);
			if (script.useTicks)	
			{				
				script.totalTicks = EditorGUILayout.Slider("Total Ticks", script.totalTicks, 3, 10);     	
				script.startWithTick = EditorGUILayout.Toggle("Start with Tick", script.startWithTick);
				if (!script.startWithTick)
				{
					var message = "If the Status Effect does not start with a tick, the total" +
						" number of ticks is reduced by 1. Example: It shows 3 Total Ticks but" + 
						" with this boolean active, it will be actually 2.";
					EditorGUILayout.HelpBox(message, UnityEditor.MessageType.None);
				}
			}
			else
			{
				script.startWithTick = true;
				script.totalTicks = 3;
			}
    	}
    }

    private function ShowBoldLabel(message: String)
    {
		EditorGUILayout.LabelField(message, EditorStyles.boldLabel);  
    }
	
	private function ShowDuplicationOptions()
	{
		ShowBoldLabel("Duplication Options");
		if (script.IsOverTime() || script.IsPermanent())
			script.independent = EditorGUILayout.Toggle("Independent", script.independent);
		else
			script.independent = false;
					
		if (!script.independent)
		{
			if (script.IsOverTime())
				script.refreshable = EditorGUILayout.Toggle("Refreshable", script.refreshable);
			else
				script.refreshable = false;
		
			script.stackable = EditorGUILayout.Toggle("Stackable", script.stackable);		
			if (script.stackable)
			{
				script.stackIncrease = EditorGUILayout.IntField("Stack Increase", script.stackIncrease);
				if (script.stackIncrease < 1)
					script.stackIncrease = 1;
				script.maxStacks = EditorGUILayout.IntField("Max Stacks", script.maxStacks);
				if (script.maxStacks < 2)
					script.maxStacks = 2;
			}
			else
			{
				script.stackIncrease = 1;
				script.maxStacks = 2;
			}
		}
		else
		{
			script.refreshable = false;
			script.stackable = false;
		}
	}
}
