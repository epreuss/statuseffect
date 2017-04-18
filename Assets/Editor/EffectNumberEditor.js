#pragma strict

@CustomEditor (EffectNumber)
class EffectNumberEditor extends Editor 
{
	var script: EffectNumber;	
	
    function OnInspectorGUI()
    {   
        script = target;
						
		if (script.useOtherAttr && !script.useGraduate)
		{
			ShowBoldLabel("Basic");			
			script.mode = EditorGUILayout.EnumPopup("Mode", script.mode);
			ShowHelpBox("Type of Use Other Attr is always SUM.");
			script.type = EffectNumberType.SUM;
			ShowPartOfBasicConfigs();
			
			EditorGUILayout.Space();  	
			ShowBoldLabel("Advanced");						

			ShowUseOtherAttrFull();
			
			script.useGraduate = EditorGUILayout.Toggle("Use Graduate", script.useGraduate);											
			script.graduateTo = 0;
		}
		else if (script.useGraduate && !script.useOtherAttr)
		{
			ShowBoldLabel("Basic");			
			ShowHelpBox("Mode of Use Graduate is always TICK.");
			script.mode = ApplyMode.TICK;			
			script.type = EditorGUILayout.EnumPopup("Type", script.type);
			ShowPartOfBasicConfigs();
						
			EditorGUILayout.Space();  	
			ShowBoldLabel("Advanced");						

			script.useOtherAttr = EditorGUILayout.Toggle("Use Other Attr", script.useOtherAttr);					
			
			ShowUseGraduateFull();
		}
		else if (script.useOtherAttr && script.useGraduate)
		{
			ShowBoldLabel("Basic");			
			ShowHelpBox("Mode of Use Graduate is always TICK.");
			script.mode = ApplyMode.TICK;
			ShowHelpBox("Type of Use Other Attr is always SUM.");
			script.type = EffectNumberType.SUM;
			ShowPartOfBasicConfigs();
						
			EditorGUILayout.Space();  	
			ShowBoldLabel("Advanced");						

			ShowUseOtherAttrFull();			
			ShowUseGraduateFull();
		}
		else
		{			
			ShowAllBasicConfigs();			
			EditorGUILayout.Space();  	
			ShowBoldLabel("Advanced");			
			script.useOtherAttr = EditorGUILayout.Toggle("Use Other Attr", script.useOtherAttr);					
			script.useGraduate = EditorGUILayout.Toggle("Use Graduate", script.useGraduate);					
		}			
    }   

	private function ShowHelpBox(message: String)
    {
		EditorGUILayout.HelpBox(message, UnityEditor.MessageType.None);
    }
	
    private function ShowBoldLabel(message: String)
    {
		EditorGUILayout.LabelField(message, EditorStyles.boldLabel);  
    }	
	
	private function ShowUseOtherAttrFull()
	{
		script.useOtherAttr = EditorGUILayout.Toggle("Use Other Attr", script.useOtherAttr);				
		ShowHelpBox("The following attribute's base value is multiplied by this effect's Value. The result is added to this effect's Target Attr.");
		script.baseValueOf = EditorGUILayout.EnumPopup("Base Value Of", script.baseValueOf);							
	}
	
	private function ShowUseGraduateFull()
	{
		script.useGraduate = EditorGUILayout.Toggle("Use Graduate", script.useGraduate);								
		ShowHelpBox("Graduates this effect's Value to a desired value. " + 
			"In depth, it overrides the basic TICK effect that increases Value by itself (summing or multiplying).");
		script.graduateTo = EditorGUILayout.FloatField("Graduate To", script.graduateTo);										
	}
	
	private function ShowAllBasicConfigs()
	{
		ShowBoldLabel("Basic");
		script.mode = EditorGUILayout.EnumPopup("Mode", script.mode);
		script.type = EditorGUILayout.EnumPopup("Type", script.type);
		ShowPartOfBasicConfigs();
	}
	
	private function ShowPartOfBasicConfigs()
	{
		script.targetAttr = EditorGUILayout.EnumPopup("Target Attr", script.targetAttr);
		script.value = EditorGUILayout.FloatField("Value", script.value);
		if (script.mode == ApplyMode.LEAVE)			
		{
			script.permanent = true;			
			ShowHelpBox("LEAVE effects are always permanent.");
		}
		else
			script.permanent = EditorGUILayout.Toggle("Permanent", script.permanent);								
	}
}
