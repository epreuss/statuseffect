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
        	ShowMode();        	
        }
    	EditorGUILayout.Space();  

        ShowSprite();      
        EditorGUILayout.Space();  

		ShowEffectsList();
		EditorGUILayout.Space();
  
  		ShowDuration();
    	EditorGUILayout.Space();

        //EditorGUILayout.HelpBox("OPA", UnityEditor.MessageType.None);
        
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

    private function ShowSprite()
    {
    	ShowBoldLabel("HUD");
        script.showHUD = EditorGUILayout.Toggle("Show On HUD", script.showHUD);	
        if (script.showHUD)
        	script.icon = EditorGUILayout.ObjectField("Sprite Icon", script.icon, typeof(Sprite)) as Sprite;
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
    	if (script.durationType == StatusEffectDurationType.INSTANT)
    	{
  			script.duration = 0;
  			script.useTicks = false;
  			script.totalTicks = 3;
  		}
  		else
  		{
  			script.duration = EditorGUILayout.FloatField("Duration", script.duration);
	    	script.useTicks = EditorGUILayout.Toggle("Use Tick", script.useTicks);
	    	if (script.useTicks)	    	
	    		script.totalTicks = EditorGUILayout.Slider("Total Ticks", script.totalTicks, 3, 10);     	
	    	else
	    		script.totalTicks = 3;
    	}
    }

    private function ShowBoldLabel(message: String)
    {
		EditorGUILayout.LabelField(message, EditorStyles.boldLabel);  
    }
}
