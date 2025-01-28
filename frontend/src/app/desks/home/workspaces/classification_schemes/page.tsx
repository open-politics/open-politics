'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth from "@/hooks/useAuth";
import withAdminAuth from '@/hooks/withAdminAuth';
import { useWorkspaceDataStore } from '@/store/useWorkspaceDataStore';
import { ClassificationSchemeCreate } from "@/client/models";

export default withAdminAuth(function ClassificationSchemeManagementPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('str');
  const [expectedDatatype, setExpectedDatatype] = useState('');
  const [prompt, setPrompt] = useState('');
  const [inputText, setInputText] = useState('');
  const [modelAnnotations, setModelAnnotations] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(false);

  const [schemeFields, setSchemeFields] = useState<
    Array<{ fieldName: string; fieldType: string; fieldDescription: string }>
  >([{ fieldName: '', fieldType: '', fieldDescription: '' }]);

  function handleChangeFieldValue(
    index: number,
    key: 'fieldName' | 'fieldType' | 'fieldDescription',
    value: string
  ) {
    const updatedFields = [...schemeFields];
    updatedFields[index][key] = value;
    setSchemeFields(updatedFields);
  }

  function handleAddField() {
    setSchemeFields((prev) => [
      ...prev,
      { fieldName: '', fieldType: '', fieldDescription: '' },
    ]);
  }

  function handleRemoveField(index: number) {
    setSchemeFields((prev) => prev.filter((_, i) => i !== index));
  }

  const { user, isLoading } = useAuth();
  const {
    classificationSchemes,
    fetchClassificationSchemes,
    createClassificationScheme,
    deleteClassificationScheme,
  } = useWorkspaceDataStore();
  const { activeWorkspace } = useWorkspaceDataStore();

  useEffect(() => {
    if (activeWorkspace) {
      fetchClassificationSchemes(activeWorkspace.uid);
    }
  }, [activeWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await createClassificationScheme(activeWorkspace!.uid, {
        name,
        description,
        type,
        expected_datatype: expectedDatatype,
        prompt,
        input_text: inputText,
        field_annotations: schemeFields.map(field => field.fieldName),
        model_annotations: modelAnnotations,
      } as ClassificationSchemeCreate);

      setName('');
      setDescription('');
      setType('str');
      setExpectedDatatype('');
      setPrompt('');
      setInputText('');
      setSchemeFields([{ fieldName: '', fieldType: '', fieldDescription: '' }]);
      setModelAnnotations('');

      alert('Classification scheme created successfully');
    } catch (error) {
      setErrorMessage('Failed to create classification scheme. Please try again.');
      console.error('Error creating classification scheme:', error);
    }
  };

  const handleDelete = async (schemeId: number) => {
    if (confirm('Are you sure you want to delete this classification scheme?')) {
      try {
        await deleteClassificationScheme(activeWorkspace!.uid, schemeId);
        alert('Classification scheme deleted successfully');
      } catch (error) {
        console.error('Error deleting classification scheme:', error);
      }
    }
  };

  if (!activeWorkspace) {
    return (
      <p className="text-center text-red-400">
        Please select a workspace to manage classification schemes.
      </p>
    );
  }

  return (
    <div className="relative flex justify-center items-center mx-auto top-4 overflow-y-auto bg-primary-950">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-8xl p-4 overflow-y-auto">
        {/* Manage Classification Schemes Card */}
        <Card className="bg-primary-900 shadow-morphic p-6 rounded-3xl col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-secondary-500 text-center">
              Manage Classification Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-primary-800 rounded-xl shadow-inner">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classificationSchemes.map((scheme) => (
                    <tr key={scheme.id} className="even:bg-primary-850">
                      <td className="px-6 py-4 text-secondary-200">{scheme.id}</td>
                      <td className="px-6 py-4 text-secondary-200">{scheme.name}</td>
                      <td className="px-6 py-4 text-secondary-200">{scheme.type}</td>
                      <td className="px-6 py-4">
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(scheme.id)}
                          className="bg-red-500 hover:bg-red-600 text-primary-950 font-semibold py-1 px-3 rounded-xl shadow-morphic"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {classificationSchemes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-secondary-400">
                        No classification schemes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Classification Scheme Card */}
        <Card className="bg-primary-900 shadow-morphic p-4 rounded-3xl col-span-1">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-secondary-500 text-center">
              Create New Classification Scheme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Scheme Name"
                  required
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                >
                  <option value="int">Integer</option>
                  <option value="str">String</option>
                  <option value="List[str]">List of Strings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Expected Datatype</label>
                <Input
                  type="text"
                  value={expectedDatatype}
                  onChange={(e) => setExpectedDatatype(e.target.value)}
                  placeholder="Expected Datatype"
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Prompt</label>
                <Input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Prompt"
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-1">Input Text</label>
                <Input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Input Text"
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={isAdvanced}
                  onChange={() => setIsAdvanced(!isAdvanced)}
                  className="mr-2"
                />
                <label className="text-sm text-secondary-300">Advanced Schema Configuration</label>
              </div>

              {isAdvanced ? (
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Fields (mimicking a Pydantic model)
                  </label>
                  {schemeFields.map((fieldDef, index) => (
                    <div className="flex items-center space-x-2 mb-2" key={index}>
                      <Input
                        placeholder="Field name"
                        value={fieldDef.fieldName}
                        onChange={(e) =>
                          handleChangeFieldValue(index, 'fieldName', e.target.value)
                        }
                        className="flex-1 p-2 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                      />
                      <div>
                      <select
                        value={fieldDef.fieldType}
                        onChange={(e) =>
                          handleChangeFieldValue(index, 'fieldType', e.target.value)
                        }
                        className="bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                      >
                        <option value="int">Integer</option>
                        <option value="str">String</option>
                          <option value="List[str]">List of Strings</option>
                        </select>
                      </div>
                      <Input
                        placeholder="Field description"
                        value={fieldDef.fieldDescription}
                        onChange={(e) =>
                          handleChangeFieldValue(index, 'fieldDescription', e.target.value)
                        }
                        className="flex-1 p-2 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                      />
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="bg-red-500 hover:bg-red-600 text-primary-950 font-semibold px-3 rounded-xl shadow-morphic"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleAddField}
                    className="mt-2 bg-secondary-700 hover:bg-secondary-600 text-white font-semibold px-3 rounded-xl shadow-morphic"
                  >
                    Add Field
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-secondary-300 mb-1">Single Field</label>
                  <Input
                    type="text"
                    value={schemeFields[0].fieldName}
                    onChange={(e) => handleChangeFieldValue(0, 'fieldName', e.target.value)}
                    placeholder="Field Name"
                    className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-secondary-300 mb-1">Model Annotations</label>
                <Input
                  type="text"
                  value={modelAnnotations}
                  onChange={(e) => setModelAnnotations(e.target.value)}
                  placeholder="Model Annotations"
                  className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                />
              </div>

              {errorMessage && <p className="text-red-400">{errorMessage}</p>}
              <Button
                type="submit"
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-primary-950 font-semibold py-2 rounded-xl shadow-morphic"
              >
                Create Classification Scheme
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});