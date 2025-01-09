import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { EditorProps as CodeEditorProps } from '@uiw/react-textarea-code-editor';
import { Toggle } from "@/components/ui/toggle"
import { Bold, Strikethrough, Code } from 'lucide-react'

const CodeEditor = dynamic<CodeEditorProps>(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false }
);

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface RichSqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    ['bold', 'strike'],
    ['code-block'],
  ]
};

const formats = ['bold', 'strike', 'code-block'];

export function RichSqlEditor({ value, onChange, placeholder, readOnly = false }: RichSqlEditorProps) {
  const [isCodeView, setIsCodeView] = useState(true);

  const handleToggleView = () => {
    if (!readOnly) {
      setIsCodeView(!isCodeView);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Toggle 
          aria-label="Toggle bold" 
          disabled={isCodeView || readOnly}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Toggle strikethrough" 
          disabled={isCodeView || readOnly}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Toggle code view" 
          pressed={isCodeView} 
          onPressedChange={handleToggleView}
          disabled={readOnly}
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>
      {isCodeView ? (
        <CodeEditor
          value={value}
          language="sql"
          placeholder={placeholder}
          onChange={(evn) => !readOnly && onChange(evn.target.value)}
          padding={15}
          style={{
            fontSize: 12,
            backgroundColor: "#1e1e1e",
            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
          readOnly={readOnly}
        />
      ) : (
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

