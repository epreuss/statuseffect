#pragma strict

@CustomEditor (EffectNumber)
class EffectNumberEditor extends Editor 
{
	var script: EffectNumber;	
	
    function OnInspectorGUI()
    {   
        script = target;
						
		if (script.useAdvanced)
		{
			ShowBoldLabel("Basic");			
			script.mode = EditorGUILayout.EnumPopup("Mode", script.mode);
			ShowHelpBox("Advanced type is always SUM.");
			script.type = EffectNumberType.SUM;
			script.targetAttr = EditorGUILayout.EnumPopup("Target Attr", script.targetAttr);
			script.value = EditorGUILayout.FloatField("Value", script.value);			
			script.permanent = EditorGUILayout.Toggle("Permanent", script.permanent);						
			
			EditorGUILayout.Space();  	
			ShowBoldLabel("Advanced");						
			script.useAdvanced = EditorGUILayout.Toggle("Use Advanced", script.useAdvanced);					
			ShowHelpBox("The following attribute's base value is multiplied by Value and the result is added to the Target Attr's current value.");
			script.baseValueOf = EditorGUILayout.EnumPopup("Base Value Of", script.baseValueOf);			
		}
		else
		{
			ShowBoldLabel("Basic");
			script.mode = EditorGUILayout.EnumPopup("Mode", script.mode);
			script.type = EditorGUILayout.EnumPopup("Type", script.type);
			script.targetAttr = EditorGUILayout.EnumPopup("Target Attr", script.targetAttr);
			script.value = EditorGUILayout.FloatField("Value", script.value);
			script.permanent = EditorGUILayout.Toggle("Permanent", script.permanent);			
			if (script.mode == ApplyMode.LEAVE)			
				script.permanent = true;			
			script.useAdvanced = EditorGUILayout.Toggle("Use Advanced", script.useAdvanced);
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
}
