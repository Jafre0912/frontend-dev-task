// src/app/block-portfolio/components/custom-blocks/ProjectCard.tsx

import { Block } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { FaProjectDiagram } from "react-icons/fa";

export const projectCardSpec = {
  type: "projectCard",
  props: {
    title: { default: "Untitled Project" },
    previewImage: { default: "" },
    nestedContent: { default: [] },
  },
  content: "none",
} as const;

type ProjectCardBlock = Block<typeof projectCardSpec>;

export const ProjectCard = createReactBlockSpec(
  projectCardSpec,
  {
    render: (props) => {
      const block = props.block as ProjectCardBlock;

      const handleClick = () => {
        const event = new CustomEvent<Block>("openProjectModal", {
          detail: block,
        });
        window.dispatchEvent(event);
      };

      return (
        <div 
          className="project-card-wrapper border border-gray-300 rounded-lg my-2 shadow-sm hover:bg-gray-100 cursor-pointer overflow-hidden"
          onClick={handleClick}
        >
          {/* NEW: Conditionally renders the preview image if it exists */}
          {block.props.previewImage && (
            <img 
              src={block.props.previewImage} 
              alt={block.props.title} 
              className="w-full h-32 object-cover" 
            />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg m-0">{block.props.title}</h3>
            <p className="text-gray-600 m-0 mt-1">Click to edit this project.</p>
          </div>
        </div>
      );
    },
    slashMenuTrigger: {
      icon: FaProjectDiagram,
    },
  }
);