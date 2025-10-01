// src/app/blocknote-portfolio/components/ProjectCardModal.tsx

"use client";

import { useEffect } from "react";
import { Block, type BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";
import { useCreateBlockNote, BlockNoteView } from "@blocknote/react";

type Props = {
  isOpen: boolean;
  block: Block | null;
  onClose: () => void;
  mainEditor: BlockNoteEditorType; 
};

export const ProjectCardModal = ({ isOpen, block, onClose, mainEditor }: Props) => {
  const nestedEditor = useCreateBlockNote();

  useEffect(() => {
    if (isOpen && block) {
      const content = (block.props as any).nestedContent || [];
      nestedEditor.replaceBlocks(nestedEditor.document, content as PartialBlock[]);
    }
  }, [isOpen, block, nestedEditor]);

  if (!isOpen || !block) {
    return null;
  }

  // This function runs every time content in the MODAL editor changes
  const handleContentChange = (editor: BlockNoteEditor) => {
    const nestedContent = editor.document;
    
    // Find the first heading to use as the title
    const titleBlock = nestedContent.find(b => b.type === 'heading');
    const title = titleBlock?.content?.[0]?.text || 'Untitled Project';
    
    // Find the first image to use as the preview
    const imageBlock = nestedContent.find(b => b.type === 'image');
    const previewImage = (imageBlock?.props as any)?.url || '';
    
    // Update the original block in the MAIN editor
    mainEditor.updateBlock(block, {
      props: {
        title: title,
        previewImage: previewImage,
        nestedContent: nestedContent, // Save all content back
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
        <div className="border rounded-md min-h-[400px] overflow-y-auto">
          <BlockNoteView
            editor={nestedEditor}
            theme="light"
            onChange={() => handleContentChange(nestedEditor)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};