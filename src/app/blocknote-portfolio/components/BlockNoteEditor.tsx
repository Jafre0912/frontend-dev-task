// src/app/blocknote-portfolio/components/BlockNoteEditor.tsx

"use client";

import { useState, useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import { Block, BlockNoteEditor as BlockNoteEditorType, defaultBlockSpecs, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote, createReactBlockSpec } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { FaProjectDiagram } from "react-icons/fa";

// ====================================================================================
// 1. CUSTOM BLOCK DEFINITION (ProjectCard)
// ====================================================================================

const projectCardSpec = {
  type: "projectCard",
  props: {
    title: { default: "Untitled Project" },
    previewImage: { default: "" },
    nestedContent: { default: [] },
  },
  content: "none",
} as const;

// REMOVED `type ProjectCardBlock = ...` as it's no longer needed and causes errors.

const ProjectCard = createReactBlockSpec(
  projectCardSpec,
  {
    render: (props) => {
      // REMOVED the type assertion `as ProjectCardBlock`. TypeScript now infers this automatically.
      const block = props.block;
      
      const handleClick = () => {
        const event = new CustomEvent<Block>("openProjectModal", { detail: block });
        window.dispatchEvent(event);
      };

      return (
        <div 
          className="border border-gray-300 rounded-lg my-2 shadow-sm hover:bg-gray-100 cursor-pointer overflow-hidden"
          onClick={handleClick}
        >
          {block.props.previewImage && (
            <img src={block.props.previewImage} alt={block.props.title} className="w-full h-32 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg m-0">{block.props.title}</h3>
            <p className="text-gray-600 m-0 mt-1">Click to edit this project.</p>
          </div>
        </div>
      );
    },
    slashMenuTrigger: { icon: FaProjectDiagram },
  }
);

// ====================================================================================
// 2. MODAL COMPONENT (ProjectCardModal)
// ====================================================================================

type ModalProps = {
  isOpen: boolean;
  block: Block | null;
  onClose: () => void;
  mainEditor: BlockNoteEditorType;
};

const ProjectCardModal = ({ isOpen, block, onClose, mainEditor }: ModalProps) => {
  const nestedEditor = useCreateBlockNote();

  useEffect(() => {
    if (isOpen && block) {
      const content = (block.props as any).nestedContent || [];
      nestedEditor.replaceBlocks(nestedEditor.document, content as PartialBlock[]);
    }
  }, [isOpen, block, nestedEditor]);

  if (!isOpen || !block) return null;

  const handleContentChange = (editor: BlockNoteEditorType) => {
    const nestedContent = editor.document;
    const titleBlock = nestedContent.find(b => b.type === 'heading');
    const title = titleBlock?.content?.[0]?.text || 'Untitled Project';
    const imageBlock = nestedContent.find(b => b.type === 'image');
    const previewImage = (imageBlock?.props as any)?.url || '';
    
    mainEditor.updateBlock(block, {
      props: { title, previewImage, nestedContent },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
        <div className="border rounded-md min-h-[400px] overflow-y-auto">
          <BlockNoteView editor={nestedEditor} theme="light" onChange={() => handleContentChange(nestedEditor)} />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================================
// 3. MAIN EDITOR COMPONENT
// ====================================================================================

export default function BlockNoteEditor() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  
  const editor = useCreateBlockNote({
    blockSpecs: {
      ...defaultBlockSpecs,
      projectCard: ProjectCard,
    },
  });

  const handleOpenModal = (block: Block) => {
    setEditingBlock(block);
    setModalOpen(true);
  };

  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Block>;
      handleOpenModal(customEvent.detail);
    };
    window.addEventListener("openProjectModal", handleCustomEvent);
    return () => window.removeEventListener("openProjectModal", handleCustomEvent);
  }, []);

  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        const savedContent = localStorage.getItem("editorContent");
        if (savedContent) {
          editor.replaceBlocks(editor.document, JSON.parse(savedContent) as PartialBlock[]);
        } else {
          editor.replaceBlocks(editor.document, [{ type: "heading", content: "Welcome to Unimad Editor" }]);
        }
      }, 0);
    }
  }, [editor]);

  const handleSave = () => {
    const content = editor.document;
    localStorage.setItem("editorContent", JSON.stringify(content));
    fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
    alert("Content saved!");
  };

  return (
    <div>
      <ProjectCardModal isOpen={isModalOpen} block={editingBlock} onClose={() => setModalOpen(false)} mainEditor={editor} />
      
      <div className="max-w-3xl mx-auto my-8 flex flex-col gap-4">
        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Content</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border">
          <BlockNoteView
            editor={editor}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}